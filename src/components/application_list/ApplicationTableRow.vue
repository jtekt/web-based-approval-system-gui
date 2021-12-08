<template>

  <tr v-on:click="see_application()">

    <td>{{format_date(application.properties.creation_date)}}</td>
    <td>{{application.properties.type}}</td>
    <td>{{application.properties.title}}</td>

    <td
      class=""
      v-if="options.show_applicant">
      {{applicant.properties.display_name}}
    </td>

    <td
      class=""
      v-if="options.show_next_recipient">
      {{next_recipient.properties.display_name}}
    </td>

    <td v-if="options.show_progress">
      <progress
        :value="progress"
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
    application: Object,
    options: {type:Object, default: () => ({})},

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
    applicant () {
      return this.application.applicant
    },
    next_recipient () {
      return this.application.recipients
        .slice()
        .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
        .find(recipient => !recipient.approval)
    },
    progress () {
      return 100 * this.application.recipients.filter(recipient => recipient.approval).length / this.application.recipients.length
    },
    recipient_count () {
      return 'TBD'
    },
    approval_percent () {

      return 'TBD'
    },


  }
}
</script>

<style scoped>

progress {
  width: 100%;
}

</style>
