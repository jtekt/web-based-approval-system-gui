<template>
  <div class="show_application">

    <template v-if="!loading && !error">
      <div class="application_container" v-if="application">

        <div class="two_column_layout">

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
              <span>複製 / Duplicate</span>
            </button>
          </template>



          <template v-if="user_is_current_recipient && !user_has_refused">
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
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import ContentDuplicateIcon from 'vue-material-design-icons/ContentDuplicate.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'



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
    ArrowLeftIcon,
    DeleteIcon,
    ContentDuplicateIcon,
    CheckIcon,
    CloseIcon,
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

    approve () {
      // ask for confirmation
      if (!confirm('ホンマ？')) return

      // send POST to mark as approved
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/approve`
      this.axios.post(url)
        .then(() => {
          // Refresh the approval flow
          this.get_approval_flow()

          // Send an email
          let next_recipient = this.next_recipient
          if(!next_recipient) return
          this.send_email(next_recipient)

        })
        .catch((error) => {alert(`Error approving application`)})
    },
    reject () {
      if (!confirm('ホンマ？')) return
      let reason = prompt('なぜ？', '')
      if(!reason) return

      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/reject`
      this.axios.post(url, { reason: reason })
        .then(() => this.get_approval_flow())
        .catch(() => alert('Error rejecting application'))
    },
    delete_application () {
      if (!confirm('ホンマ？')) return
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}`
      this.axios.delete(url)
        .then(() => this.$router.push('/'))
        .catch(() => alert(`Error deleting application`))
    },
    edit_a_copy () {
      this.$router.push({ path: '/create_application', query: { copy_of: this.application.identity.low } })
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
    current_recipient(){
      let next_recipient_record = this.recipient_records.find(record => {
        let recipient = record._fields[record._fieldLookup['submitted_to']]
        return recipient.properties.flow_index.low === this.approval_count
      })

      if (!next_recipient_record) return null
      return next_recipient_record._fields[next_recipient_record._fieldLookup['recipient']]
    },
    next_recipient(){
      let next_recipient_record = this.recipient_records.find(record => {
        let recipient = record._fields[record._fieldLookup['submitted_to']]
        return recipient.properties.flow_index.low === this.approval_count + 1
      })

      if (!next_recipient_record) return null
      return next_recipient_record._fields[next_recipient_record._fieldLookup['recipient']]
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
    user_has_refused(){
      let user_id = this.$store.state.current_user.identity.low

      let refusal = this.recipient_records.find(record => {
        let refusal_node = record._fields[record._fieldLookup['rejection']]
        if(!refusal_node) return false
        let recipient_id = refusal_node.start.low
        return recipient_id === user_id
      })

      if(refusal) return true
      else return false
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
  margin-top: 25px;
  display: flex;
  justify-content: space-around;
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
