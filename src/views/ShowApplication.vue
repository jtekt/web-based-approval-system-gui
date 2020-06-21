<template>
  <div class="show_application">

    <template v-if="!loading && !error">
      <div class="application_container" v-if="application">

        <!-- information about the application form -->
        <div class="application_info">

          <table class="">

            <!-- Application info -->
            <tr>
              <th colspan="2">申請情報 / Application details</th>
            </tr>
            <tr>
              <td>ID</td>
              <td>{{application.identity.low}}</td>
            </tr>
            <tr>
              <td>タイトル / Title</td>
              <td>{{application.properties.title}}</td>
            </tr>
            <tr>
              <td>タイプ / Type</td>
              <td>{{application.properties.type}}</td>
            </tr>

            <tr>
              <td>日付 / Date</td>
              <td>
                {{application.properties.creation_date.year.low}}/{{application.properties.creation_date.month.low}}/{{application.properties.creation_date.day.low}}
              </td>
            </tr>
            <tr>
              <td>申請者 / Applicant</td>
              <td>{{applicant.properties.display_name}}</td>
            </tr>
            <tr>
              <td>機密 / Confidential</td>
              <td>
                <input
                type="checkbox"
                v-bind:disabled="!user_is_applicant"
                v-model="application.properties.private"
                v-on:change="update_privacy_of_application()">
              </td>
            </tr>

            <!-- Visibility -->
            <tr v-if="application.properties.private">
              <td>共有 / Visibility</td>
              <td>

                <template v-if="groups.length > 0">
                  <div
                    v-for="group in groups"
                    class="group"
                    v-bind:key="group.identity.low">
                    <span class="">
                      {{group.properties.name}}
                    </span>

                    <template v-if="user_is_applicant">
                      <div class="growing_spacer"/>
                      <button
                        type="button"
                        v-on:click="remove_application_visibility_to_group(group)">
                        remove
                      </button>
                    </template>

                  </div>
                </template>
                <div class="" v-else>
                  承認フローのみ / Approval flow only
                </div>

                <div class="">
                  <button
                    type="button"
                    v-on:click="modal_open = true"
                    v-if="user_is_applicant">Add a group</button>
                </div>
              </td>
            </tr>

            <!-- Actual data of the application -->
            <tr>
              <th colspan="2">申請内容 / Application content</th>
            </tr>

            <!-- If form data is stored as an array (experiment) -->
            <!-- THIS IS HOW CURRENT APPLICATIONS ARE RENDERED -->
            <tr v-for="field in form_data" v-if="Array.isArray(form_data)">
              <td>{{field.label}}</td>

              <td v-if="field.type === 'file' && field.value">
                <span
                  v-on:click="download(field.value)"
                  class="mdi mdi-download download_button"/>
              </td>

              <td v-else-if="field.type === 'checkbox'">
                <span v-if="field.value" class="mdi mdi-check"/>
                <span v-else class="mdi mdi-close"/>
              </td>

              <td v-else-if="field.type === 'date'">
                <span v-if="field.value">{{new Date(field.value).toLocaleDateString('ja-JP')}}</span>
                <span v-else>-</span>
              </td>

              <td v-else-if="field.value">{{field.value}}</td>

              <!-- missing value -->
              <td v-else>-</td>
            </tr>

            <!-- LEGACY -->
            <!-- If form data is an object (OLD style) -->
            <tr v-for="value, key in form_data" v-if="!Array.isArray(form_data)">
              <td>{{key}}</td>
              <td v-if="key === 'report_file' || key === 'file'">
                <span
                  v-on:click="download(value)"
                  class="mdi mdi-download download_button"/>
              </td>
              <td v-else>{{value}}</td>
            </tr>
            <!-- END OF LEGACY -->

          </table>

          <!-- actions at the bottom: Delete or duplicate-->
          <div
            class="actions_container"
            v-if="user_is_applicant">

            <IconButton
              v-on:clicked="delete_application(application.identity.low)"
              icon="mdi-delete"
              bordered>
              削除 / Delete</IconButton>

            <IconButton
              v-on:clicked="edit_a_copy(application.identity.low)"
              icon="mdi-content-duplicate"
              bordered>
              複製 / Duplicate</IconButton>

          </div>

        </div>

        <!-- area with the hankos -->
        <div class="approval_flow_column">
          <div class="hanko_container_container" >

            <!-- inner wrapper exists so that arrows can be placed between hanko containers -->
            <div
              class="hanko_container_container_intermediate_wrapper"
              v-for="(recipient_record, index) in recipient_records">

              <span v-if="index>0" class="arrow mdi mdi-arrow-left"/>

              <WebHankoContainer
                v-bind:applicationRecord="recipient_record"
                v-on:approve="approve(application.identity.low)"
                v-on:reject="reject(application.identity.low)"
                v-on:cancel="cancel(application.identity.low)"
                v-bind:hankoable="hankoable(recipient_record)"/>
            </div>

          </div>

          <!-- area for refusals reasons -->
          <div class="refusal_reasons">
            <table>
              <tr
                v-for="(recipient_record, index) in recipient_records"
                v-if="recipient_record._fields[recipient_record._fieldLookup['rejection']]">
                <td class="refuser_name">{{recipient_record._fields[recipient_record._fieldLookup['recipient']].properties.family_name_kanji }}</td>
                <td>{{recipient_record._fields[recipient_record._fieldLookup['rejection']].properties.reason}}</td>
              </tr>
            </table>

          </div>
        </div>

      </div>

      <div class="not_found" v-else>Application does not exist or is private</div>
    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader>Loading application</Loader>
    </div>

    <div class="not_found" v-if="error">
      Error loading application
    </div>

    <Modal :open="modal_open" @close="modal_open=false">
      <h2 class="">
        Share application with a group
      </h2>
      <div class="group_picker_wrapper">
        <GroupPicker
          class="picker"
          :apiUrl="picker_api_url"
          v-on:selection="share_with_group($event)"/>
      </div>
    </Modal>

  </div>
</template>

<script>
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'
import IconButton from '@/components/IconButton.vue'
import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'
import GroupPicker from '@moreillon/vue_group_picker'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    IconButton,
    Loader,
    Modal,
    GroupPicker
  },
  mounted () {
    this.get_application()
    this.get_visibility()
    this.get_approval_flow()
  },
  data () {
    return {

      recipient_records: [], // LEGACY, SHOULD BE DELETED WHEN DONE

      loading: false,
      error: null,

      // experimental
      application: null,
      applicant: null,

      groups: [],
      recipient_records: [],

      modal_open: false
    }
  },
  methods: {
    get_application () {
      // Get the body of the application, regardless of its recipients
      // This gets the applicant as well (for the time being)

      // TODO: CHeck if id in query
      this.loading = true
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application`, {
        params: { application_id: this.$route.query.id }
      })
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
    get_visibility () {
      // Gets the groups wi which this application is visible
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/visibility`, {
        params: { application_id: this.$route.query.id }
      })
        .then(response => {
          this.groups = []
          response.data.forEach((record) => {
            let group = record._fields[record._fieldLookup['group']]
            this.groups.push(group)
          })
        })
        .catch((error) => console.log(error))
    },
    get_approval_flow () {
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/recipients`, {
        params: { application_id: this.$route.query.id }
      })
        .then(response => {
          this.recipient_records = []
          response.data.forEach((record) => {
            this.recipient_records.push(record)
          })
        })
        .catch((error) => console.log(error))
    },
    delete_application (application_id) {
      if (confirm('ホンマ？')) {
        this.axios.delete(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application`, {
          params: { application_id: application_id }
        })
          .then(() => this.$router.push('/'))
          .catch(() => alert(`Error deleting application`))
      }
    },
    approve (application_id) {
      // ask for confirmation
      if (confirm('ホンマ？')) {
        // send POST to mark as approved
        this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/approve`, {
          application_id: application_id
        })
          .then(() => {
            this.get_approval_flow()

            // Code to send email
            let next_recipient_record = this.recipient_records.find(e => {
              return e._fields[e._fieldLookup['submitted_to']].properties.flow_index.low === this.approval_count + 1
            })

            if (next_recipient_record) {
              let next_recipient = next_recipient_record._fields[next_recipient_record._fieldLookup['recipient']]

              if (confirm(`Send notification email ?`)) {
              // Weird formatting because preserves indentation
                window.location.href = `
mailto:${next_recipient.properties.email_address}
?subject=[自動送信] ${this.application.properties.type}を提出しました
&body=${next_recipient.properties.name_kanji}　様%0D%0A
%0D%0A
提出先URL%0D%0A
${process.env.VUE_APP_SHINSEI_MANAGER_FRONT_URL}/show_application?id=${this.application.identity.low}%0D%0A
%0D%0A
確認お願いします。%0D%0A
              `
              }
            }
          })
          .catch((error) => {
            console.log(error)
            alert(`Error approving application`)
          })
      }
    },
    reject (application_id) {
      if (confirm('ホンマ？')) {
        var reason = prompt('なぜ？', '')

        if (reason) {
          this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/reject`, {
            application_id: application_id,
            reason: reason
          })
            .then(() => this.get_approval_flow())
            .catch(() => alert('Error rejecting application'))
        }
      }
    },
    update_privacy_of_application () {
      this.axios.put(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/privacy`, {
        application_id: this.application.identity.low,
        private: this.application.properties.private
      })
        .then(() => {})
        .catch(() => alert('Error updating privacy of application'))
    },

    edit_a_copy (application_id) {
      this.$router.push({ path: '/create_application', query: { copy_of: application_id } })
    },
    download (id) {
      window.location.href = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/file?file_id=${id}&application_id=${this.application.identity.low}`
    },
    see_template (id) {
      this.$router.push({ path: '/edit_application_template', query: { id: id } })
    },
    hankoable (recipient_record) {
      let flow_index = recipient_record._fields[recipient_record._fieldLookup['submitted_to']].properties.flow_index.low
      return flow_index === this.approval_count
    },
    share_with_group (group) {
      this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/visibility_to_group`, {
        application_id: this.application.identity.low,
        group_id: group.identity.low
      })
        .then(() => {
          this.modal_open = false
          this.get_visibility()
        })
        .catch(() => alert('Error updating visibility of application'))
    },
    remove_application_visibility_to_group (group) {
      this.axios.delete(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application/visibility_to_group`, {
        params: {
          application_id: this.application.identity.low,
          group_id: group.identity.low
        }
      })
        .then(() => {
          this.get_visibility()
        })
        .catch(() => alert('Error updating visibility of application'))
    }

  },
  computed: {
    form_data () {
      return JSON.parse(this.application.properties.form_data)
    },
    based_on_template () {
      if (this.template) return true
      else return false
    },
    approval_count () {
      return this.recipient_records.reduce((approval_count, e) => {
        return approval_count + !!e._fields[e._fieldLookup['approval']]
      }, 0)
    },
    picker_api_url () {
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
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

  margin: 15px;
  padding: 5px;

  display: flex;
  flex-wrap: wrap-reverse; /* THIS IS BRILLIANT */

}

.application_container > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 400px;
}

.application_info {
}

/* Application info table */
.application_info table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.application_info td, .application_info th {
  padding: 5px;
}

.application_info th {
  padding-top: 10px;
}

.application_info td {
  border-top: 1px solid #dddddd;
}

/* Hanko area */
.approval_flow_column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.hanko_container_container{
  /* horizontal layout */
  display: flex;
  justify-content: flex-end;
}

.hanko_container_container_intermediate_wrapper{
  /* exists so as to contan arrows */
  display: flex;
  align-items: flex-start;
}

.arrow{
  height: 150px;
  display: flex;
  align-items: center;
}

.refusal_reasons{
  margin-left: 25px;
  margin-top: 15px;
  margin-right: 5px;
  margin-bottom: 15px;
}

.refusal_reasons table {
  border: 1px solid #dddddd;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
.refusal_reasons table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.refusal_reasons table td {
  padding: 5px;
}

.refusal_reasons table th:first-child {
  width: 20%;
}
.refusal_reasons table .refuser_name {
  width: 20%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

/* MISC */
.not_found {
  padding: 25px;
  text-align: center;
}

.actions_container {
  margin-top: 25px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-around;
}

.action_button{
  border: 1px solid #444444;
  border-radius: 5px;
  padding: 5px;
  font-size: 120%;
  cursor: pointer;
  transition: color 0.25s border-color 0.25s;
}

.action_button:hover {
  color: #c00000;
  border-color: #c00000;
}

.download_button{
  font-size: 150%;
  cursor: pointer;
}

.template_row {
  cursor: pointer;
  transition: color 0.25s border-color 0.25s;
}

.template_row:hover {
  color: #c00000;
}

.group_picker_wrapper {
  height: 50vh;
  width: 75vw;
}

.group {
  display: flex;
  justify-content: center;
}
.growing_spacer {
  flex-grow: 1;
}
</style>
