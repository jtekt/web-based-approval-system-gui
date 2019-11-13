<template>
  <div class="application_container">


    <div class="application_info">
      <table>

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
          <th colspan="2">申請内容</th>
        </tr>
        <tr v-for="value, key in JSON.parse(application.properties.form_data)">
          <td>{{key}}</td>
          <td v-if="key === 'report_file'"><a v-bind:href="'http://webhanko.mike.jtekt.maximemoreillon.com/uploads/' + value">download</a></td>
          <td v-else>{{value}}</td>
        </tr>



        <!-- actions -->
        <tr>
          <th colspan="2">Actions</th>
        </tr>
        <tr>
          <td colspan="2">
            <button
              type="button"
              v-if="application.applicant.properties.employee_number === get_employee_number"
              v-on:click="delete_application(application.identity.low)">
              Bye bye!
            </button>
          </td>
        </tr>


      </table>

    </div>


    <div class="inkans_area">

      <!--
      <WebHankoContainer
        v-for="submission in application.submissions"
        v-bind:recipient="submission"/>
      -->

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

        <!-- else show approve button, but only if in a position to approve-->
        <div
          class=""
          v-else-if="submission.recipient.properties.employee_number === get_employee_number">

          <button
            type="button"
            v-on:click="approve_application(application.identity.low)">
            Approve
          </button>

          <button
          type="button"
          v-on:click="disapprove_application(application.identity.low)">
            disapprove
          </button>

        </div>


      </InkanBox>
    </div>



  </div>
</template>

<script>
import InkanQR from '@/components/InkanQR.vue'
import InkanBox from '@/components/InkanBox.vue'

import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'

import {get_employee_number} from '@/mixins/get_employee_number.js'


export default {
  name: 'Application',
  components: {
    WebHankoContainer,
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
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/approve_application', {
        application_id: application_id,
      })
      .then(response => this.$emit('reload') )
      .catch(error => console.log(error) );
    },
    disapprove_application(application_id){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/disapprove_application', {
        application_id: application_id,
      })
      .then(response => this.$emit('reload') )
      .catch(error => console.log(error) );
    },
    delete_application(application_id){
      if(confirm("ホンマ？")){
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/delete_application', {
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
