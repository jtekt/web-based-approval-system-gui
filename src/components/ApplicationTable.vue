<template>
  <div class="application_table_container">
    <table class="application_table" v-if="applications.length > 0">
      <tr class="headers_row">
        <th>ID</th>
        <th>Date</th>
        <th>Type</th>
      </tr>
      <tr
        v-for="application in applications"
        v-on:click="see_application(application._fields[0].identity.low)">
        <td>{{application._fields[0].identity.low}}</td>
        <td>{{formatted_date(application)}}</td>
        <td>{{application._fields[0].properties.type}}</td>
      </tr>
    </table>
    <div class="" v-else>
      No data
    </div>
  </div>


</template>

<script>
import ApplicationTable from '@/components/ApplicationTable.vue'

export default {
  name: 'ApplicationTable',
  props: {
    applications: Array
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
  text-align: center;

}
th, td {
  padding: 5px;
}
td{
  border-top: 1px solid #dddddd;
}

tr:not(.headers_row) {
  cursor: pointer;
  transition: background-color 0.25s;
}

tr:not(.headers_row):hover {
  background-color: #eeeeee;
}


</style>
