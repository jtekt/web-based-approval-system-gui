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

        <!-- Actions -->
        <tr>
          <th colspan="2">Actions</th>
        </tr>
        <tr>
          <td colspan="2">
            <button type="button" v-on:click="see_application(application.identity.low)">
              Details
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
        <InkanQR
          v-if="submission.approval"
          v-bind:name="submission.recipient.properties.family_name_kanji"
          v-bind:date="submission.approval.properties.date"
          v-bind:approval_id="submission.approval.identity.low"
        />

      </InkanBox>
    </div>



  </div>
</template>

<script>
import InkanQR from '@/components/InkanQR.vue'
import InkanBox from '@/components/InkanBox.vue'

import {get_employee_number} from '@/mixins/get_employee_number.js'

export default {
  name: 'ApplicationPreview',
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
    see_application(application_id){
      this.$router.push({ name: 'show_application', query: { id: application_id } })
    },
  },


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
