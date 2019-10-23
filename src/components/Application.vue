<template>
  <div class="application_container">


    <div class="application_info">
      <table>

        <!-- Application info -->
        <tr>
          <th colspan="2">Application info</th>
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
          <td>{{application.properties.creation_date}}</td>
        </tr>

        <!-- Applicant info -->
        <tr>
          <th colspan="2">Applicant info</th>
        </tr>
        <tr>
          <td>Name</td>
          <td>{{application.applicant.properties.name_kanji}}</td>
        </tr>
        <tr>
          <td>Employee number</td>
          <td>{{application.applicant.properties.employee_number}}</td>
        </tr>

        <!-- form data -->
        <tr>
          <th colspan="2">Form data</th>
        </tr>
        <tr v-for="value, key in JSON.parse(application.properties.form_data)">
          <td>{{key}}</td>
          <td v-if="key === 'report_file'"><a v-bind:href="'http://172.16.98.151:9723/uploads/' + value">download</a></td>
          <td v-else>{{value}}</td>
        </tr>



        <!-- actions -->
        <tr>
          <th colspan="2">Actions</th>
        </tr>
        <tr>
          <td colspan="2">
            <button type="button" v-on:click="delete_application(application.identity.low)">
              Bye bye!
            </button>
          </td>
        </tr>


      </table>

    </div>


    <div class="inkans_area">

      <InkanBox
        v-for="submission in application.submissions"
        v-bind:submission="submission"
      >

        <!-- Show inkan if approved -->
        <InkanQR
          v-if="submission.approval"
          v-bind:name="submission.recipient.properties.family_name_kanji"
          v-bind:date="submission.approval.properties.date"
          v-bind:approval_id="submission.approval.identity.low"
        />

        <!-- else show approve button -->
        <button
          v-else-if="submission.recipient.properties.employee_number === get_employee_number"
          type="button"
          v-on:click="approve_application(application.identity.low)"
        >
          Approve
        </button>

      </InkanBox>
    </div>



  </div>
</template>

<script>
import InkanQR from '@/components/InkanQR.vue'
import InkanBox from '@/components/InkanBox.vue'

import {get_employee_number} from '@/mixins/get_employee_number.js'


export default {
  name: 'Application',
  components: {
    InkanQR,
    InkanBox
  },
  mixins: [
    get_employee_number
  ],
  props: {
    application: Object,
  },
  methods: {
    approve_application(application_id){
      this.axios.post('http://172.16.98.151:9723/approve_application', {
        application_id: application_id,
      })
      .then(response => this.$emit('reload') )
      .catch(error => {
        console.log(error);
      });
    },
    delete_application(application_id){
      if(confirm("ホンマ？")){
        this.axios.post('http://172.16.98.151:9723/delete_application', {
          application_id: application_id,
        })
        .then(response => this.$emit('reload'))
        .catch(error => console.log(error))
      }
    },
  },


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>



</style>
