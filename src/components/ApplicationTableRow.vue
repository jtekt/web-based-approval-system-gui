<template>

  <tr v-on:click="see_application()">

    <td>{{format_date(application.properties.creation_date)}}</td>

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

    <td v-if="show_progress">
      <progress
        :value="approval_percent"
        min="0"
        max="100"/>
    </td>

  </tr>
</template>

<script>
import DateFormatting from '@/mixins/DateFormatting.js'

export default {
  name: 'ApplicationTableRow',
  props: {
    application_record: Object
  },
  mixins: [
    DateFormatting
  ],
  data () {
    return {
      loading: false,
      error: null
    }
  },
  methods: {
    see_application () {
      const application_id = this.application.identity
      this.$router.push({ name: 'application', params: { application_id } })
    }
  },
  computed: {
    application () {
      return this.application_record._fields[this.application_record._fieldLookup['application']]
    },
    applicant () {
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
    approval_percent () {
      if (typeof (this.approval_count) === 'undefined' || typeof (this.recipient_count) === 'undefined') return undefined
      return 100 * (this.approval_count / this.recipient_count)
    },
    show_progress () {
      return typeof (this.approval_count) !== 'undefined'
    }

  }
}
</script>

<style scoped>

</style>
