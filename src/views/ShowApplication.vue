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
            @view_pdf="view_pdf($event)"
            @visibility_update="get_application()"/>

          <!-- area with the hankos and refusal comments -->
          <div class="approval_flow_column">
            <div class="approval_flow" >

              <!-- inner wrapper exists so that arrows can be placed between hanko containers -->
              <template
                v-for="(submission, index) in ordered_submissions">



                <arrow-left-icon
                  class="arrow"
                  v-if="index>0"/>


                <WebHankoContainer
                  :applicant="applicant"
                  :recipient="recipient_of_submission(submission)"
                  :approval="approval_of_recipient(recipient_of_submission(submission))"
                  :rejection="rejection_of_recipient(recipient_of_submission(submission))"

                  :is_current_submission="submission === current_submission"

                  @approve="approve()"
                  @reject="reject()"
                  @send_email="send_email($event)"/>


              </template>

            </div>

            <!-- area for refusals reasons -->
            <RefusalReason
              :rejections="rejections"
              :recipients="recipients"/>

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
        :application_id="application.identity.low"/>

    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader>Loading application</Loader>
    </div>

    <div class="not_found error_message" v-if="error">
      Error loading application
    </div>



  </div>
</template>

<script>
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'

import PdfViewer from '@/components/PdfViewer.vue'
import RefusalReason from '@/components/RefusalReason.vue'
import ApplicationInfo from '@/components/ApplicationInfo.vue'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    PdfViewer,
    RefusalReason,
    ApplicationInfo,
  },
  mounted () {
    this.get_application()
    //this.get_approval_flow()
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
      selected_file_id: null,



    }
  },
  methods: {
    get_application () {
      // Get the body of the application, regardless of its recipients
      // This gets the applicant as well (for the time being)

      this.loading = true

      let application_id = this.$route.params.application_id
        || this.$route.params.id
        || this.$route.query.application_id
        || this.$route.query.id


      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${application_id}`
      this.axios.get(url)
        .then(response => {

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
        .finally(() => this.loading = false)
    },
    approve () {
      // ask for confirmation
      if (!confirm('ホンマ？ Confirm approval?')) return

      // send POST to mark as approved
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/approve`
      this.axios.post(url)
        .then(() => {

          // Send an email
          console.log(this.next_recipient)
          if(this.next_recipient) this.send_email(this.next_recipient)


          // Refresh the approval flow
          this.get_application()



        })
        .catch((error) => {
          console.log(error)
          alert(`Error approving application`)
        })
    },
    reject () {
      let reason = prompt('なぜ？ / Why?', '')
      if(reason === null) return

      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/reject`
      this.axios.post(url, { reason: reason })
        .then(() => { this.get_application() })
        .catch(() => alert('Error rejecting application'))
    },
    delete_application () {
      if (!confirm('ホンマ？ Confirm deletion?')) return
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}`
      this.axios.delete(url)
        .then(() => { this.$router.push({name: 'submitted_applications'}) })
        .catch(() => alert(`Error deleting application`))
    },
    edit_a_copy () {
      this.$router.push({
        path: '/create_application',
        query: { copy_of: this.application.identity.low }
      })
    },

    view_pdf(file_id){
      this.selected_file_id = file_id
    },

    send_email(recipient){
      // Weird formatting because preserves indentation
      window.location.href = `
mailto:${recipient.properties.email_address}
?subject=[自動送信] ${this.application.properties.type}を提出しました
&body=${recipient.properties.name_kanji} 様 %0D%0A
 %0D%0A
${this.application.properties.type}を提出しました。 %0D%0A
提出先URL: %0D%0A
${window.location.origin}/applications/${this.application.identity.low}%0D%0A
 %0D%0A
確認お願いします。%0D%0A
        `
    },
    recipient_of_submission(submission){
      if(!submission) return null
      return this.recipients.find(recipient => {
        return JSON.stringify(recipient.identity) === JSON.stringify(submission.end)
      })
    },
    approval_of_recipient(recipient){
      return this.approvals.find(approval => {
        return JSON.stringify(approval.start) === JSON.stringify(recipient.identity)
      })
    },
    rejection_of_recipient(recipient){
      return this.rejections.find(rejection => {
        return JSON.stringify(rejection.start) === JSON.stringify(recipient.identity)
      })
    },

  },
  computed: {
    ordered_submissions() {
      return this.submissions.sort((a,b) => {
        return b.properties.flow_index.low - a.properties.flow_index.low
      })
    },
    approval_count () {
      return this.approvals.length
    },
    current_submission() {
      return this.submissions.find(submission => {
        return submission.properties.flow_index.low === this.approval_count
      })
    },
    current_recipient(){
      return this.recipient_of_submission(this.current_submission)
    },
    next_submission(){
      return this.submissions.find(submission => {
        return submission.properties.flow_index.low === this.approval_count + 1
      })
    },
    next_recipient(){
      return this.recipient_of_submission(this.next_submission)
    },
    user_is_applicant () {
      return this.applicant.identity.low === this.$store.state.current_user.identity.low
    },
    user_is_current_recipient(){

      let user_id = this.$store.state.current_user.identity.low
      let next_recipient = this.current_recipient
      if(!next_recipient) return false
      if(next_recipient.identity.low === user_id) return true
      else return false
    },

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
  align-items: flex-start;
}


.arrow{
  height: 150px;
  display: flex;
  align-items: center;
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
