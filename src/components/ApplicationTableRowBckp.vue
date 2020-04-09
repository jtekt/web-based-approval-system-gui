<template>
  <tr v-on:click="see_application(application._fields[application._fieldLookup['application']].identity.low)">
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

  methods: {
    see_application(application_id){
      this.$router.push({ name: 'show_application', query: { id: application_id } })
    },
  },
  computed: {
    formatted_date(){
      return this.application._fields[0].properties.creation_date.year.low + "/"
        + this.application._fields[0].properties.creation_date.month.low + "/"
        + this.application._fields[0].properties.creation_date.day.low
    },
  }
}
</script>

<style scoped>



</style>
