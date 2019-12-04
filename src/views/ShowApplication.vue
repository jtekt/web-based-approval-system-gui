<template>
  <div class="show_application">

    <!-- wrapper needed for v-if -->
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
            <td>Type</td>
            <td>{{application.properties.type}}</td>
          </tr>
          <tr>
            <td>Date</td>
            <td>
              {{application.properties.creation_date.year.low}}/{{application.properties.creation_date.month.low}}/{{application.properties.creation_date.day.low}}
            </td>
          </tr>
          <tr>
            <td>Applicant</td>
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


            <td v-else-if="field.value">{{field.value}}</td>

            <!-- missing value -->
            <td v-else>-</td>
          </tr>

          <!-- If form data is an object (original style) -->
          <tr v-for="value, key in form_data" v-if="!Array.isArray(form_data)">
            <td>{{key}}</td>
            <td v-if="key === 'report_file' || key === 'file'">
              <span
                v-on:click="download(value)"
                class="mdi mdi-download download_button"/>
            </td>
            <td v-else>{{value}}</td>
          </tr>

          <!-- actions -->
          <tr>
            <th colspan="2">Actions</th>
          </tr>
          <tr>
            <td class="actions_cell" colspan="2">
              <button
                type="button"
                v-if="applicant.properties.employee_number === this.$store.state.employee_number"
                v-on:click="delete_application(application.identity.low)">Delete</button>
              <button
                type="button"
                v-if="applicant.properties.employee_number === this.$store.state.employee_number"
                v-on:click="edit_a_copy(application.identity.low)">Edit a copy</button>
            </td>
          </tr>


        </table>

      </div>

      <!-- area with the hankos -->
      <div class="hanko_container_container" >

        <!-- inner wrapper exists so that arrows can be placed between hanko containers -->
        <div class="hanko_container_container_intermediate_wrapper" v-for="(application_record, index) in application_records">

          <span v-if="index>0" class="arrow mdi mdi-arrow-left"/>

          <WebHankoContainer
            v-bind:applicationRecord="application_record"
            v-on:approve="approve(application.identity.low)"
            v-on:reject="reject(application.identity.low)"
            v-on:cancel="cancel(application.identity.low)"/>
        </div>

      </div>

    </div>

    <div class="not_found" v-else>
      Application does not exist
    </div>




  </div>
</template>

<script>
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
  },

  mounted(){
    this.get_application();
  },
  data(){
    return {
      application_records: [],
    }
  },
  methods: {
    get_application(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_application', {
        application_id: this.$route.query.id
      })
      .then(response => {
        this.application_records = response.data
      })
      .catch(error => console.log(error));
    },
    delete_application(application_id){
      if(confirm("ホンマ？")){
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/delete_application', {
          application_id: application_id
        })
        .then( () => this.$router.push('/'))
        .catch(error => console.log(error));
      }
    },
    approve(application_id){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/approve_application', {
        application_id: application_id
      })
      .then( () => this.get_application())
      .catch(error => console.log(error));
    },
    reject(application_id){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/reject_application', {
        application_id: application_id
      })
      .then( () => this.get_application())
      .catch(error => console.log(error));
    },
    cancel(application_id){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/cancel_decision', {
        application_id: application_id
      })
      .then( () => this.get_application())
      .catch(error => console.log(error));
    },
    edit_a_copy(application_id){
      this.$router.push({path: '/create_application', query: {copy_of: application_id}})
    },
    download(id){
      window.location.href = 'http://shinseimanager.mike.jtekt.maximemoreillon.com/file?id=' + id;

    },

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
    form_data(){
      return JSON.parse(this.application.properties.form_data)
    }
  }
}
</script>

<style scoped>


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

.hanko_container_container{
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


.not_found {
  padding: 25px;
  text-align: center;
}

.actions_cell {
}

.actions_cell > * {
  margin: 10px;
}

.download_button{
  font-size: 150%;
  cursor: pointer;
}


</style>
