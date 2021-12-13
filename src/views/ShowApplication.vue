<template>
  <div class="show_application">

    <template v-if="!loading && !error && application">
      <div class="application_container">

        <div class="two_column_layout">

          <!-- information about the application form -->
          <ApplicationInfo
            :application="application"
            @view_pdf="view_pdf($event)"
            @visibility_update="get_application()"/>

          <!-- area with the hankos and refusal comments -->
          <div class="approval_flow_column">
            <div class="approval_flow" >

              <template
                v-if="!!user_as_recipient && !current_recipient" >

                <div class="flow_applicant">
                  <EmailButton
                    :user="application.applicant"
                    @send_email="send_email_to_applicant()" />
                </div>

                <div
                  class="arrow_container">
                  <arrow-left-icon
                    class="arrow" />
                </div>

              </template>

              <template
                v-for="(recipient, index) in ordered_recipients" >

                <div
                  class="arrow_container"
                  v-if="index>0"
                  :key="`flow_arrow_${index}`">
                  <arrow-left-icon
                    class="arrow" />
                </div>

                <WebHankoContainer
                  :key="`hanko_container_${index}`"
                  :recipient="recipient"
                  :application="application"

                  @approve="approve()"
                  @reject="reject()"
                  @send_email="send_email_to_recipient(recipient)"/>

              </template>

            </div>

            <!-- area for refusals reasons -->
            <ApprovalComments
              :application="application"
              @comment_updated="get_application()"/>

          </div>
        </div>



        <!-- actions at the bottom: Delete or duplicate-->
        <div
          class="actions_container">

          <!-- deletion and duplication buttons -->
          <template v-if="user_is_applicant">
            <button
              :disabled="application_is_fully_approved"
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
          <template v-if="user_as_recipient">
            <button
              :disabled="!user_is_current_recipient || application_has_refusal"
              type="button"
              class="bordered approve_button"
              @click="approve()">
              <check-icon />
              <span>承認 / Approve</span>
            </button>

            <button
              :disabled="!user_is_current_recipient || application_has_refusal"
              type="button"
              class="bordered refuse_button"
              @click="reject()">
              <close-icon />
              <span>拒否 / Refuse</span>
            </button>
          </template>

        </div>

      </div><!-- End of application container -->




      <PdfViewer
        v-if="selected_file_id"
        :selected_file_id="selected_file_id"
        :application="application"
        @pdf_stamped="get_application()"/>

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

    <div
      class="not_found error_message"
      v-if="!loading && !error && !application">
      Application not found
    </div>

  </div>
</template>

<script>

import EmailButton from '@/components/application_details/EmailButton.vue'
import WebHankoContainer from '@/components/application_details/web_hanko/WebHankoContainer.vue'
import PdfViewer from '@/components/application_details/PdfViewer.vue'
import ApprovalComments from '@/components/application_details/ApprovalComments.vue'
import ApplicationInfo from '@/components/application_details/ApplicationInfo.vue'

import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    PdfViewer,
    ApprovalComments,
    ApplicationInfo,
    EmailButton,
  },
  mixins: [
    IdUtils
  ],
  mounted () {
    this.get_application()
  },
  data () {
    return {
      loading: false,
      error: null,
      application: null,
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
    get_application(){
      this.loading = true
      this.application = null
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications/${this.application_id}`
      this.axios.get(url)
      .then(({data}) => {

        const application = data
        try {
          const parsed_form_data = JSON.parse(application.properties.form_data)
          application.properties.form_data = parsed_form_data
        } catch (e) {
          console.warn('Application form data could not be parsed')
        }

        this.application = application
      })
      .catch((error) => {
        if(error.response) {
          console.error(error.response.data)
          this.error = error.error.response.data
        }
        else {
          console.error(error)
          this.error = error
        }
      })
      .finally(() => { this.loading = false })
    },

    approve () {
      const comment = prompt('コメント (任意)/ Comment (optional)')

      // if pressed cancel, return
      if (comment === null) return

      // TODO: SHOW A LOADER

      // send POST to mark as approved
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/approve`
      this.axios.post(url, { comment })
      .then(() => {

        // Refresh the approval flow
        this.get_application()

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

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/reject`
      this.axios.post(url, { comment })
        .then(() => {
          // Notify the applicant
          //this.send_email_to_applicant()

          // Refresh the application
          this.get_application()
        })
        .catch(() => {
          console.log(error)
          alert('Error rejecting application')
        })
    },

    delete_application () {
      if (!confirm(`Delete application ${this.application_id} ?`)) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications/${this.application_id}`
      this.axios.delete(url)
        .then(() => { this.$router.push({ name: 'submitted_applications' }) })
        .catch(() => alert(`Error deleting application`))
    },
    edit_a_copy () {
      this.$router.push({
        path: '/create_application',
        query: { copy_of: this.application_id }
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
申請者: ${this.application.applicant.properties.display_name} %0D%0A
タイプ: ${this.application.properties.type} %0D%0A
タイトル: ${this.application.properties.title} %0D%0A
提出先URL: ${window.location.origin}/applications/${this.application_id} %0D%0A
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
mailto:${this.application.applicant.properties.email_address}
?subject=${this.email_subject}
&body=${this.application.applicant.properties.display_name} 様 %0D%0A
%0D%0A
申請マネージャーの通知メールです。 %0D%0A
%0D%0A
タイプ: ${this.application.properties.type} %0D%0A
タイトル: ${this.application.properties.title} %0D%0A
提出先URL: ${window.location.origin}/applications/${this.application_id} %0D%0A
%0D%0A
※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　%0D%0A
※詳しくは ${window.location.origin}/info%0D%0A
%0D%0A
確認お願いします。%0D%0A
%0D%0A
        `
    },

  },
  computed: {
    application_id () {
      // This does not change if the user edits the URL and does not press enter
      return this.$route.params.application_id ||
        this.$route.params.id ||
        this.$route.query.application_id || // To be removed
        this.$route.query.id // T be removed
    },

    ordered_recipients(){
      return this.application.recipients
        .slice()
        .sort((a, b) => b.submission.properties.flow_index - a.submission.properties.flow_index)
    },

    current_recipient(){
      // recipients sorted by flow index apparently
      if(this.application.recipients.find(recipient => recipient.refusal)) return null

      return this.application.recipients
      .slice()
      .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
      .find(recipient => !recipient.approval && !recipient.refusal)
    },

    user_is_applicant () {
      if(!this.application) return false
      const applicant_id = this.application.applicant.properties._id
      return applicant_id === this.current_user_id

    },

    user_as_recipient(){
       // current_user_id is mixin
      return this.application.recipients.find( ({properties: {_id}}) => _id === this.current_user_id)
    },

    user_is_current_recipient () {
      // USED
      if(!this.current_recipient) return false
      const current_recipient_id = this.current_recipient.properties._id
      return current_recipient_id === this.current_user_id
    },

    email_subject(){
      const {title, type} = this.application.properties
      //return `[申請マネージャ] ${title} (${type})`
      return `[申請マネージャ] ${type}`
    },

    application_has_refusal(){
      return this.application.recipients.find(recipient => recipient.refusal)
    },
    application_is_fully_approved(){
      const recipient_count = this.application.recipients.length
      const approval_count = this.application.recipients.reduce((acc, recipient) => acc + (recipient.approval ? 1 : 0), 0)
      return approval_count === recipient_count
    }


  }
}
</script>

<style scoped>

.loader_wrapper{

  margin-top: 4em;
  display: flex;
  justify-content: center;
  font-size: 120%;
}
.application_container {

  margin-top: 1em;
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

.flow_applicant{
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

</style>
