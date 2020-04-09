<template>
  <div class="show_application">

    <template v-if="!loading && !error">
      <div class="application_container" v-if="application">

        <!-- information about the application form -->
        <div class="application_info">

          <table class="">

            <!-- Application info -->
            <tr>
              <th colspan="2">申請情報</th>
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
              <td>{{applicant.properties.name_kanji}} ({{applicant.properties.employee_number}})</td>
            </tr>


            <!-- form data -->
            <tr>
              <th colspan="2">申請内容</th>
            </tr>

            <!-- If form data is stored as an array (experiment) -->
            <tr v-for="field in form_data" v-if="Array.isArray(form_data)">
              <td>{{field.label}}</td>

              <!-- need conditions for display depending on type -->

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

          </table>

          <!-- actions -->
          <div
            class="actions_container"
            v-if="applicant.properties.employee_number === this.$store.state.employee_number">

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
              v-for="(application_record, index) in application_records">

              <span v-if="index>0" class="arrow mdi mdi-arrow-left"/>

              <WebHankoContainer
                v-bind:applicationRecord="application_record"
                v-on:approve="approve(application.identity.low)"
                v-on:reject="reject(application.identity.low)"
                v-on:cancel="cancel(application.identity.low)"
                v-bind:hankoable="hankoable(application_record)"/>
            </div>

          </div>

          <!-- area for refusals reasons -->
          <div class="refusal_reasons">
            <table>
              <tr
                v-for="(application_record, index) in application_records"
                v-if="application_record._fields[application_record._fieldLookup['rejection']]">
                <td class="refuser_name">{{application_record._fields[application_record._fieldLookup['recipient']].properties.family_name_kanji }}</td>
                <td>{{application_record._fields[application_record._fieldLookup['rejection']].properties.reason}}</td>
              </tr>
            </table>

          </div>
        </div>

      </div>

      <div class="not_found" v-else>Application does not exist</div>
    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader>Loading application</Loader>
    </div>

    <div class="" v-if="error">
      Error loading application
    </div>





  </div>
</template>

<script>
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'
import IconButton from '@/components/IconButton.vue'
import Loader from '@moreillon/vue_loader'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    IconButton,
    Loader,
  },
  mounted(){
    this.get_application();
  },
  data(){
    return {
      application_records: [],
      loading: false,
      error: null,
    }
  },
  methods: {
    get_application(){
      // TODO: CHeck if id in query!!
      this.loading = true
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_application', {
        application_id: this.$route.query.id
      })
      .then(response => { this.application_records = response.data })
      .catch(() => this.error = 'Error getting application')
      .finally( () => this.loading = false)
    },
    delete_application(application_id){
      if(confirm("ホンマ？")){
        this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/delete_application', {
          application_id: application_id
        })
        .then( () => this.$router.push('/'))
        .catch( () => alert(`Error deleting application`));
      }
    },
    approve(application_id){

      // ask for confirmation
      if(confirm("ホンマ？")){

        // send POST to mark as approved
        this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/approve_application', {
          application_id: application_id
        })
        .then( () =>  {

          // Code to send email
          let next_application_record = this.application_records.find(e => {
            return e._fields[e._fieldLookup['submitted_to']].properties.flow_index.low === this.approval_count+1
          })

          if(next_application_record){

            let next_recipient = next_application_record._fields[next_application_record._fieldLookup['recipient']]

            if(confirm(`Send notification email ?`)){

              // Weird formatting because preserves indentation
              window.location.href = `
mailto:${next_recipient.properties.email_address}
?subject=[自動送信] ${this.application.properties.type}を提出しました
&body=${next_recipient.properties.name_kanji}　様%0D%0A
%0D%0A
提出先URL%0D%0A
${VUE_APP_SHINSEI_MANAGER_FRONT_URL}/show_application?id=${this.application.identity.low}%0D%0A
%0D%0A
確認お願いします。%0D%0A
              `
            }
          }
          this.get_application()
        })
        .catch(() => alert(`Error approving application`));
      }
    },
    reject(application_id){

      if(confirm("ホンマ？")){

        var reason = prompt("なぜ？", "");

        if(reason){
          this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/reject_application', {
            application_id: application_id,
            reason: reason,
          })
          .then( () => this.get_application())
          .catch( () => alert('Error rejecting application'));
        }
      }
    },
    /*
    cancel(application_id){
      // This route is no longer in use since hankos cannot be canceled anymore
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/cancel_decision', {
        application_id: application_id
      })
      .then( () => this.get_application())
      .catch(error => console.log(error));
    },
    */


    edit_a_copy(application_id){
      this.$router.push({path: '/create_application', query: {copy_of: application_id}})
    },
    download(id){
      window.location.href = process.env.VUE_APP_SHINSEI_MANAGER_URL + '/file?id=' + id;
    },
    see_template(id){
      this.$router.push({path: '/edit_application_template', query: {id: id}})
    },
    hankoable(application_record){
      let flow_index = application_record._fields[application_record._fieldLookup['submitted_to']].properties.flow_index.low
      return flow_index === this.approval_count
    }


  },
  computed: {
    application(){
      if(this.application_records.length > 0) return this.application_records[0]._fields[this.application_records[0]._fieldLookup['application']]
      else return null
    },
    applicant(){
      if(this.application_records.length > 0) return this.application_records[0]._fields[this.application_records[0]._fieldLookup['applicant']]
      else return null
    },
    template(){
      if(this.application_records.length > 0) return this.application_records[0]._fields[this.application_records[0]._fieldLookup['aft']]
      else return null
    },
    form_data(){
      return JSON.parse(this.application.properties.form_data)
    },
    based_on_template(){
      if(this.template) return true
      else return false
    },
    approval_count(){
      return this.application_records.reduce((approval_count, e) => {
        return approval_count + !!e._fields[e._fieldLookup['approval']];
      },0)
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


</style>
