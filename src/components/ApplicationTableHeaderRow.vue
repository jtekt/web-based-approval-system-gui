<template>
  <tr class="headers_row">
    <!--<th>ID</th>-->
    <th>日付 / Date</th>
    <th>種類 / Type</th>
    <th v-if="!hideApplicant">申請者 / Applicant</th>
    <th>タイトル / Title</th>
  </tr>


</template>

<script>

export default {
  name: 'ApplicationTableHeaderRow',
  props: {
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
    formatted_date(){
      return this.application._fields[0].properties.creation_date.year.low + "/"
        + this.application._fields[0].properties.creation_date.month.low + "/"
        + this.application._fields[0].properties.creation_date.day.low + "/"
    },
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



tr:not(.headers_row) {
  cursor: pointer;
  transition: background-color 0.25s;
}

tr:not(.headers_row):hover {
  background-color: #eeeeee;
}


</style>
