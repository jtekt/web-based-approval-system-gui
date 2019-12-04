<template>
  <div class="application_table_container">
    <table class="application_table">

      <tr>
        <th colspan="1000" class="table_section_header first_header">申請中 / Pending</th>
      </tr>
      <ApplicationTableHeaderRow v-bind:hideApplicant="hideApplicant"/>
      <ApplicationTableRow
        v-for="application in applications.pending"
        v-bind:application="application"
        v-bind:hideApplicant="hideApplicant"
        v-on:click="see_application(application._fields[0].identity.low)"/>

      <tr>
        <th colspan="1000" class="table_section_header">却下 / Rejected</th>
      </tr>
      <ApplicationTableHeaderRow v-bind:hideApplicant="hideApplicant"/>
      <ApplicationTableRow
        v-for="application in applications.rejected"
        v-bind:application="application"
        v-bind:hideApplicant="hideApplicant"
        v-on:click="see_application(application._fields[0].identity.low)"/>

      <tr>
        <th colspan="1000" class="table_section_header">承認 / Approved</th>
      </tr>
      <ApplicationTableHeaderRow v-bind:hideApplicant="hideApplicant"/>
      <ApplicationTableRow
        v-for="application in applications.approved"
        v-bind:application="application"
        v-bind:hideApplicant="hideApplicant"
        v-on:click="see_application(application._fields[0].identity.low)"/>


    </table>
  </div>
</template>

<script>
import ApplicationTableRow from '@/components/ApplicationTableRow.vue'
import ApplicationTableHeaderRow from '@/components/ApplicationTableHeaderRow.vue'


export default {
  name: 'ApplicationTable',
  components: {
    ApplicationTableRow,
    ApplicationTableHeaderRow,
  },
  props: {
    applications: Object,
    hideApplicant: {
      type: Boolean,
      default(){return false}
    },
  },
  mixins: [],
  mounted(){

  },
  methods: {
    see_application(application_id){
      this.$router.push({ name: 'show_application', query: { id: application_id } })
    },
    formatted_date(application){
      return application._fields[0].properties.creation_date.year.low + "/"
        + application._fields[0].properties.creation_date.month.low + "/"
        + application._fields[0].properties.creation_date.day.low + "/"
    },

  },
  computed: {

  }
}
</script>

<style scoped>

table{
  width: 100%;
  border-collapse: collapse;
  text-align: left;

}
th, td {
  padding: 5px;
}
td{
  border-top: 1px solid #dddddd;
}

table .table_section_header:not(.first_header) {
  padding-top: 50px;
}

table .table_section_header {
  font-size: 120%;
}


tr:not(.headers_row) {
  cursor: pointer;
  transition: background-color 0.25s;
}

tr:not(.headers_row):hover {
  background-color: #eeeeee;
}


</style>
