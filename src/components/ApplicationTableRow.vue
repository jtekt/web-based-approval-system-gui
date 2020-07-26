<template>

  <tr v-on:click="see_application()">

    <td>{{formatted_date}}</td>

    <td>{{application.properties.type}}</td>
    <td>{{application.properties.title}}</td>

    <td
      class=""
      v-if="!!applicant">
      {{applicant.properties.last_name}}
    </td>

    <td
      class=""
      v-if="!!next_recipient">
      {{next_recipient.properties.last_name}}
    </td>

    <td v-if="!!approval_count">
      <progress
        :value="approval_percent"
        min="0"
        max="100"/>
    </td>



  </tr>
</template>

<script>

export default {
  name: 'ApplicationTableRow',
  props: {
    application_record: Object,
  },
  data () {
    return {
      loading: false,
      error: null,
    }
  },
  methods: {
    see_application () {
      this.$router.push({ name: 'application', params: { application_id: this.application.identity.low } })
    },
  },
  computed: {
    application(){
      return this.application_record._fields[this.application_record._fieldLookup['application']]
    },
    applicant(){
      return this.application_record._fields[this.application_record._fieldLookup['applicant']]
    },
    next_recipient () {
      return this.application_record._fields[this.application_record._fieldLookup['next_recipient']]
    },
    approval_count () {
      return this.application_record._fields[this.application_record._fieldLookup['approval_count']]
    },
    recipient_count () {
      return this.application_record._fields[this.application_record._fieldLookup['recipient_count']]
    },

    formatted_date () {
      let date = this.application.properties.creation_date
      return `${date.year.low}/${date.month.low}/${date.day.low}`
    },
    approval_percent () {
      if(!this.approval_count || !this.recipient_count) return undefined
      return 100 * (this.approval_count.low / this.recipient_count.low)
    },

  }
}
</script>

<style scoped>

</style>
