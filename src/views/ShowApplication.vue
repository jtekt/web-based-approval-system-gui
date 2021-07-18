<template>
  <div class="show_application">

    <template v-if="!loading && !error">
      <div class="application_container" v-if="application">

        <div class="two_column_layout">

          <!-- information about the application form -->
          <ApplicationInfo
            :application="application"
            :applicant="applicant"
            :forbidden="forbidden"
            :visibility="visibility"
            :approvals="approvals"
            @view_pdf="view_pdf($event)"
            @visibility_update="get_application()"/>

          <!-- area with the hankos and refusal comments -->
          <div class="approval_flow_column">
            <div class="approval_flow" >

              <!-- inner wrapper exists so that arrows can be placed between hanko containers -->
              <template
                v-for="(submission, index) in ordered_submissions">

                <div
                  class="arrow_container"
                  v-if="index>0"
                  :key="`flow_arrow_${index}`">
                  <arrow-left-icon
                    class="arrow" />
                </div>

                <WebHankoContainer
                  :key="`hanko_container_${index}`"
                  :applicant="applicant"
                  :recipient="recipient_of_submission(submission)"
                  :approval="approval_of_recipient(recipient_of_submission(submission))"
                  :rejection="rejection_of_recipient(recipient_of_submission(submission))"

                  :is_current_submission="submission === current_submission"

                  @approve="approve()"
                  @reject="reject()"
                  @send_email="send_email_to_recipient($event)"/>

              </template>

            </div>

            <!-- area for refusals reasons -->
            <ApprovalComments
              :submissions="ordered_submissions"
              :rejections="rejections"
              :approvals="approvals"
              :recipients="recipients"
              @comment_updated="get_application()"/>

          </div>
        </div>

        <!-- actions at the bottom: Delete or duplicate-->
        <div
          class="actions_container">

          <!-- deletion and duplication buttons -->
          <template v-if="user_is_applicant">
            <button
              type="button"
              class="bordered"
              @click="delete_application()">
              <delete-icon />
              <span>削除 / Delete</span>
            </button>

            <button
              type="button"
              class="bordered"
              @click="edit_a_copy()">
              <content-duplicate-icon />
              <span>複製 / re-submit</span>
            </button>
          </template>

          <!-- Controls to approve or reject an application -->
          <template v-if="user_is_current_recipient && rejections.length === 0">
            <button
              type="button"
              class="bordered approve_button"
              @click="approve()">
              <check-icon />
              <span>承認 / Approve</span>
            </button>

            <button
              type="button"
              class="bordered refuse_button"
              @click="reject()">
              <close-icon />
              <span>拒否 / Refuse</span>
            </button>
          </template>

        </div>

      </div><!-- End of application container -->
      <div class="not_found error_message"
        v-else>
        Application not found
      </div>

      <PdfViewer
        v-if="selected_file_id"
        :selected_file_id="selected_file_id"
        :approvals="approvals"
        :application_id="application.identity"/>

    </template>

    <div
      v-if="loading"
      class="loader_wrapper" >
      <Loader>Loading application</Loader>
    </div>

    <div
      v-if="error"
      class="not_found error_message" >
      Error loading application
    </div>

  </div>
</template>

<script>
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'

import PdfViewer from '@/components/PdfViewer.vue'
import ApprovalComments from '@/components/ApprovalComments.vue'
import ApplicationInfo from '@/components/ApplicationInfo.vue'

import CurrentUserID from '@/mixins/CurrentUserID.js'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    PdfViewer,
    ApprovalComments,
    ApplicationInfo
  },
  mixins: [
    CurrentUserID
  ],
  mounted () {
    this.get_application()
  },
  data () {
    return {

      loading: false,
      error: null,

      // experimental
      application: null,
      applicant: null,
      forbidden: null,
      approvals: [],
      rejections: [],
      submissions: [],
      visibility: [],

      // Stamping pdfs
      selected_file_id: null

    }
  },
  watch: {
    application_id () {
      this.get_application()
    }
  },
  methods: {
    get_application () {
      // Get the body of the application, regardless of its recipients
      // This gets the applicant as well (for the time being)

      this.loading = true

      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}`
      this.axios.get(url)
        .then(response => {
          //console.log(response.data)
          let record = response.data

          this.application = record._fields[record._fieldLookup['application']]
          this.applicant = record._fields[record._fieldLookup['applicant']]
          this.forbidden = record._fields[record._fieldLookup['forbidden']]
          this.recipients = record._fields[record._fieldLookup['recipients']]
          this.submissions = record._fields[record._fieldLookup['submissions']]
          this.approvals = record._fields[record._fieldLookup['approvals']]
          this.rejections = record._fields[record._fieldLookup['rejections']]
          this.visibility = record._fields[record._fieldLookup['visibility']]
        })
        .catch((error) => {
          console.error(error)
          this.error = error
        })
        .finally(() => { this.loading = false })
    },
    approve () {
      const comment = prompt('コメント (任意)/ Comment (optional)')

      // if pressed cancel, return
      if (comment === null) return

      // TODO: SHOW A LOADER

      // send POST to mark as approved
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/approve`
      this.axios.post(url, { comment })
      .then(() => {
      // Notify the next recipient
        if (this.next_recipient) this.send_email_to_recipient(this.next_recipient)
        // or the applicant if flow is complete
        else this.send_email_to_applicant()

        // Refresh the approval flow
        this.get_application()

        // notify the user that there is an attachment to stamp
        this.notify_attachment()
      })
      .catch((error) => {
        console.error(error)
        alert(`Error approving application`)
      })
    },
    reject () {
      // if (!confirm('ホンマ？ Confirm rejection?')) return
      const comment = prompt('コメント (任意)/ Comment (optional)')

      // if pressed cancel, return
      if (comment === null) return

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/reject`
      this.axios.post(url, { comment })
        .then(() => {
          // Notify the applicant
          this.send_email_to_applicant()

          // Refresh the application
          this.get_application()
        })
        .catch(() => {
          console.log(error)
          alert('Error rejecting application')
        })
    },
    notify_attachment () {
      // const form_data = JSON.parse(this.application.properties.form_data)
      // const found_file = form_data.find(field => field.type === 'file')
      // if (found_file) alert(`申請には承認されました。ただし、この申請は添付ファイル付いている申請なので、ファイルにハンコを押すのを忘れないようにお願いいたします。`)
    },
    delete_application () {
      if (!confirm('ホンマ？ Confirm deletion?')) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}`
      this.axios.delete(url)
        .then(() => { this.$router.push({ name: 'submitted_applications' }) })
        .catch(() => alert(`Error deleting application`))
    },
    edit_a_copy () {
      this.$router.push({
        path: '/create_application',
        query: { copy_of: this.application.identity }
      })
    },

    view_pdf (file_id) {
      this.selected_file_id = file_id
    },

    send_email_to_recipient (recipient) {
      // Weird formatting because preserves indentation
      // TODO: Stop relying on name_kanji
      window.location.href = `
mailto:${recipient.properties.email_address}
?subject=${this.email_subject}
&body=${recipient.properties.display_name} 様 %0D%0A
%0D%0A
申請マネージャーの通知メールです。 %0D%0A
%0D%0A
申請を提出しました。 %0D%0A
%0D%0A
申請者: ${this.applicant.properties.display_name} %0D%0A
タイプ: ${this.application.properties.type} %0D%0A
タイトル: ${this.application.properties.title} %0D%0A
提出先URL: ${window.location.origin}/applications/${this.application.identity} %0D%0A
%0D%0A
※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　%0D%0A
※詳しくは ${window.location.origin}/info%0D%0A
%0D%0A
確認お願いします。%0D%0A
%0D%0A
        `
    },
    send_email_to_applicant () {
      // Weird formatting because preserves indentation
      // TODO: Stop relying on name_kanji
      window.location.href = `
mailto:${this.applicant.properties.email_address}
?subject=${this.email_subject}
&body=${this.applicant.properties.display_name} 様 %0D%0A
%0D%0A
申請マネージャーの通知メールです。 %0D%0A
%0D%0A
タイプ: ${this.application.properties.type} %0D%0A
タイトル: ${this.application.properties.title} %0D%0A
提出先URL: ${window.location.origin}/applications/${this.application.identity} %0D%0A
%0D%0A
※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　%0D%0A
※詳しくは ${window.location.origin}/info%0D%0A
%0D%0A
確認お願いします。%0D%0A
%0D%0A
        `
    },
    recipient_of_submission (submission) {
      if (!submission) return null
      return this.recipients.find(recipient => {
        return recipient.identity === submission.end
      })
    },
    approval_of_recipient (recipient) {
      return this.approvals.find(approval => {
        return approval.start === recipient.identity
      })
    },
    rejection_of_recipient (recipient) {
      return this.rejections.find(rejection => {
        return rejection.start === recipient.identity
      })
    }

  },
  computed: {
    application_id () {
      return this.$route.params.application_id ||
        this.$route.params.id ||
        this.$route.query.application_id ||
        this.$route.query.id
    },
    ordered_submissions () {
      return this.submissions.slice().sort((a, b) => {
        return b.properties.flow_index - a.properties.flow_index
      })
    },
    approval_count () {
      return this.approvals.length
    },
    current_submission () {
      return this.submissions.find(submission => {
        return submission.properties.flow_index === this.approval_count
      })
    },
    current_recipient () {
      return this.recipient_of_submission(this.current_submission)
    },
    next_submission () {
      return this.submissions.find(submission => {
        return submission.properties.flow_index === this.approval_count + 1
      })
    },
    next_recipient () {
      return this.recipient_of_submission(this.next_submission)
    },
    user_is_applicant () {
      return this.applicant.identity === this.current_user_id
    },
    user_is_current_recipient () {
      const next_recipient = this.current_recipient
      if (!next_recipient) return false

      return next_recipient.identity === this.current_user_id
    },

    email_subject(){
      const {title, type} = this.application.properties
      //return `[申請マネージャ] ${title} (${type})`
      return `[申請マネージャ] ${type}`
    }


  }
}
</script>

<style scoped>

.loader_wrapper{
  display: flex;
  justify-content: center;
  font-size: 120%;
}
.application_container {

  border: 1px solid #444444;
  border-radius: 5px;

  padding: 0.5em;
}

.two_column_layout {
  display: flex;
  flex-wrap: wrap-reverse; /* THIS IS BRILLIANT */
}

.two_column_layout > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 400px;
}

/* Hanko area */
.approval_flow_column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.approval_flow{
  /* horizontal layout */
  display: flex;
  justify-content: flex-end;
  /* because wrap reverse */
  align-items: flex-end;
  flex-wrap: wrap-reverse;
}

.arrow_container {

}
.arrow{
  margin-top: 70px;
}

.not_found {
  padding: 25px;
  text-align: center;
}

.actions_container {
  margin-top: 1em;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.actions_container > * {
  margin: 0.5em;
  flex-basis: 12em;
}

.approve_button {
  color: #00c000;
  border-color: #00c000;
}

.approve_button:hover {
  color: white;
  background-color: #00c000;
  border-color: #00c000;
}
.refuse_button {
  color: #c00000;
  border-color: #c00000;
}

.refuse_button:hover {
  color: white;
  background-color: #c00000;
  border-color: #c00000;
}

</style>
