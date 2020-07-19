<template>
  <div class="show_application">

    <template v-if="!loading && !error">
      <div class="application_container" v-if="application">

        <!-- information about the application form -->
        <ApplicationInfo
          :application="application"
          :applicant="applicant"
          @view_pdf="view_pdf($event)"/>

        <!-- area with the hankos -->
        <div class="approval_flow_column">
          <div class="approval_flow" >

            <!-- inner wrapper exists so that arrows can be placed between hanko containers -->
            <template
              v-for="(recipient_record, index) in recipient_records">

              <arrow-left-icon
                class="arrow"
                v-if="index>0"/>

              <WebHankoContainer
                v-bind:applicationRecord="recipient_record"
                v-on:approve="approve(application.identity.low)"
                v-on:reject="reject(application.identity.low)"
                v-bind:is_next_recipient="is_next_recipient(recipient_record)"
                @send_email="send_email($event)"/>
            </template>

          </div>

          <!-- area for refusals reasons -->
          <RefusalReason :recipient_records="recipient_records"/>

        </div>

      </div><!-- End of application container -->
      <div class="not_found" v-else>Application does not exist or is private</div>

      <PdfViewer
        v-if="selected_file_id"
        :selected_file_id="selected_file_id"
        :recipient_records="recipient_records"
        :application_id="application.identity.low"/>

    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader>Loading application</Loader>
    </div>

    <div class="not_found" v-if="error">
      Error loading application
    </div>



  </div>
</template>

<script>
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'
import IconButton from '@/components/IconButton.vue'
import Loader from '@moreillon/vue_loader'

import PdfViewer from '@/components/PdfViewer.vue'
import RefusalReason from '@/components/RefusalReason.vue'
import ApplicationInfo from '@/components/ApplicationInfo.vue'

import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue'





export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    IconButton,
    Loader,
    PdfViewer,
    RefusalReason,
    ApplicationInfo,

    // Icons
    ArrowLeftIcon
  },
  mounted () {
    this.get_application()
    this.get_approval_flow()
  },
  data () {
    return {

      loading: false,
      error: null,

      // experimental
      application: null,
      applicant: null,

      recipient_records: [],

      // Stamping pdfs
      selected_file_id: null,

    }
  },
  methods: {
    get_application () {
      // Get the body of the application, regardless of its recipients
      // This gets the applicant as well (for the time being)

      // TODO: CHeck if id in query
      // TODO: Get recipients with the same call
      this.loading = true
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}`
      this.axios.get(url)
        .then(response => {
          if (response.data.length > 0) {
            let record = response.data[0]
            this.application = record._fields[record._fieldLookup['application']]
            this.applicant = record._fields[record._fieldLookup['applicant']]
          }
        })
        .catch((error) => { this.error = error })
        .finally(() => this.loading = false)
    },

    get_approval_flow () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/recipients`

      this.axios.get(url)
        .then(response => {
          this.recipient_records = []
          response.data.forEach((record) => {
            this.recipient_records.push(record)

            let approval = record._fields[record._fieldLookup['approval']]
            if(!approval) return
            if(!approval.properties.attachment_hankos) return
            approval.properties.attachment_hankos = JSON.parse(approval.properties.attachment_hankos)

          })
        })
        .catch((error) => console.log(error))
    },

    approve (application_id) {
      // ask for confirmation
      if (!confirm('ホンマ？')) return

      // send POST to mark as approved
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/approve`
      this.axios.post(url)
        .then(() => {
          // Refresh the approval flow
          this.get_approval_flow()

          // Code to send email
          let next_recipient_record = this.recipient_records.find(record => {
            let recipient = record._fields[record._fieldLookup['submitted_to']]
            return recipient.properties.flow_index.low === this.approval_count + 1
          })

          if (!next_recipient_record) return
          let next_recipient = next_recipient_record._fields[next_recipient_record._fieldLookup['recipient']]

          this.send_email(next_recipient)



        })
        .catch((error) => {
          console.error(error)
          alert(`Error approving application`)
        })
    },
    reject (application_id) {
      if (!confirm('ホンマ？')) return
      let reason = prompt('なぜ？', '')
      if(!reason) return

      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/reject`
      this.axios.post(url, { reason: reason })
        .then(() => this.get_approval_flow())
        .catch(() => alert('Error rejecting application'))
    },

    is_next_recipient (recipient_record) {
      let flow_index = recipient_record._fields[recipient_record._fieldLookup['submitted_to']].properties.flow_index.low
      return flow_index === this.approval_count
    },

    view_pdf(file_id){
      this.selected_file_id = file_id
    },

    send_email(recipient){
      // Weird formatting because preserves indentation
      window.location.href = `
mailto:${recipient.properties.email_address}
?subject=[自動送信] ${this.application.properties.type}を提出しました
&body=${recipient.properties.name_kanji}様 %0D%0A
 %0D%0A
${this.application.properties.type}を提出しました。 %0D%0A
提出先URL: ${window.location.origin}/show_application?id=${this.application.identity.low} %0D%0A
 %0D%0A
確認お願いします。%0D%0A
        `
    }

  },
  computed: {
    approval_count () {
      return this.recipient_records.reduce((approval_count, e) => {
        return approval_count + !!e._fields[e._fieldLookup['approval']]
      }, 0)
    },

    user_is_applicant () {
      return this.applicant.identity.low === this.$store.state.current_user.identity.low
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

  padding: 5px;

  display: flex;
  flex-wrap: wrap-reverse; /* THIS IS BRILLIANT */
}

.application_container > * {
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



/* MISC */
.not_found {
  padding: 25px;
  text-align: center;
}




</style>
