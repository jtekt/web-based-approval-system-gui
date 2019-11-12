<template>
  <div class="submitted_applications">

    <div class="">

    </div>
    <table>
      <tr>
        <th colspan="100%" class="category_title">Pending applications</th>
      </tr>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Date</th>
      </tr>
      <tr
        class="application_row"
        v-for="application in applications"
        v-if="!application_is_approved(application)"
        v-on:click="see_application(application.identity.low)">
        <td>{{application.identity.low}}</td>
        <td>{{application.properties.type}}</td>
        <td>{{application.properties.creation_date}}</td>
      <tr>
        <th colspan="100%" class="category_title">Approved applications</th>
      </tr>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Date</th>
      </tr>
      <tr
        class="application_row"
        v-for="application in applications"
        v-if="application_is_approved(application)"
        v-on:click="see_application(application.identity.low)">
        <td>{{application.identity.low}}</td>
        <td>{{application.properties.type}}</td>
        <td>{{application.properties.creation_date}}</td>

      </tr>
    </table>
  </div>



</template>

<script>
// @ is an alias to /src
import ApplicationPreview from '@/components/ApplicationPreview.vue'


// Mixins
import {parse_application_records} from '@/mixins/parse_application_records.js'


export default {
  name: 'SubmittedApplications',
  components: {
    ApplicationPreview,

  },
  mixins: [
    parse_application_records
  ],
  data: function(){
    return {
      applications: [],
    }
  },
  mounted: function(){
    this.get_submitted_applications();
  },
  methods: {
    get_submitted_applications(){
      this.axios.post('http://webhanko.mike.jtekt.maximemoreillon.com/get_submitted_applications', {})
      .then(response => this.parse_application_records(response.data.records))
      .catch(error => console.log(error))
    },
    see_application(application_id){
      this.$router.push({ name: 'show_application', query: { id: application_id } })
    },
    application_is_approved(application){
      for (var i = 0; i < application.submissions.length; i++) {
        if(!application.submissions[i].approval) return false;
      }
      return true;
    },
  }
}
</script>

<style scoped>


table{
  width: 100%;
  border-collapse: collapse;
  text-align: center;

}
th, td {
  padding: 5px;
}
td{
  border-top: 1px solid #dddddd;
}

.application_row {
  cursor: pointer;
}

.application_row:hover {
  background-color: #eeeeee;
}

.category_title {
  font-size: 120%;
  padding: 10px;
}


</style>
