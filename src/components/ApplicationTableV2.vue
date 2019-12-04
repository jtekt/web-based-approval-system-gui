<template>
  <div class="application_table_container">
    <table class="application_table">

      <tr class="table_section_header_row">
        <th colspan="1000" >申請中 / Pending</th>
      </tr>
      <ApplicationTableHeaderRow v-bind:hideApplicant="hideApplicant"/>
      <ApplicationTableRow
        v-for="application in applications.pending"
        v-bind:application="application"
        v-bind:hideApplicant="hideApplicant"/>

      <tr class="table_section_header_row">
        <th colspan="1000" >却下 / Rejected</th>
      </tr>
      <ApplicationTableHeaderRow v-bind:hideApplicant="hideApplicant"/>
      <ApplicationTableRow
        v-for="application in applications.rejected"
        v-bind:application="application"
        v-bind:hideApplicant="hideApplicant"/>

      <tr class="table_section_header_row">
        <th colspan="1000" >承認 / Approved</th>
      </tr>

      <ApplicationTableHeaderRow v-bind:hideApplicant="hideApplicant"/>
      <ApplicationTableRow
        v-for="application in applications.approved"
        v-bind:application="application"
        v-bind:hideApplicant="hideApplicant"/>


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

th {
  text-align: left;
}

tr:not(.table_section_header_row):not(:last-child){
  border-bottom: 1px solid #dddddd;
}


table .table_section_header_row{
  font-size: 120%;
}

/* Spacing between table sections */
table .table_section_header_row:not(:first-child) th{
  padding-top: 50px;
}




tr:not(.headers_row):not(.table_section_header_row) {
  cursor: pointer;
  transition: background-color 0.25s;
}

tr:not(.headers_row):not(.table_section_header_row):hover {
  background-color: #eeeeee;
}


</style>
