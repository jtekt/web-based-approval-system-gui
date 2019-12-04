<template>
  <tr>
    <td>{{formatted_date}}</td>
    <td>
      {{application._fields[application._fieldLookup['application']].properties.type}}
    </td>
    <td v-if="!hideApplicant">
      {{application._fields[application._fieldLookup['applicant']].properties.name_kanji}}
      ({{application._fields[application._fieldLookup['applicant']].properties.employee_number}})
    </td>
    <td>
      {{application._fields[application._fieldLookup['application']].properties.title}}
    </td>
  </tr>


</template>

<script>

export default {
  name: 'ApplicationTable',
  props: {
    application: Object,
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
      /*
      return this.application._fields[0].properties.creation_date.year.low + "/"
        + this.application._fields[0].properties.creation_date.month.low + "/"
        + this.application._fields[0].properties.creation_date.day.low + "/"
      */
      return "yolo"
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
