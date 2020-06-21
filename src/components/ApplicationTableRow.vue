<template>

  <tr v-on:click="see_application()">

    <td>{{formatted_date}}</td>

    <td>{{application.properties.type}}</td>
    <td>{{application.properties.title}}</td>

    <td class="" v-if="applicant && !hideApplicant">
      {{applicant.properties.last_name}}
    </td>

    <td>
      <progress :value="approval_percent" min="0" max="100"/>
    </td>

    <td class="" v-if="!hideRecipient">
      <span v-if="next_approver">{{next_approver.properties.last_name}}</span>
    </td>

  </tr>
</template>

<script>

export default {
  name: 'ApplicationTable',
  props: {
    application: Object,
    hideApplicant: {
      type: Boolean, default () { return false }
    },
    hideRecipient: {
      type: Boolean, default () { return false }
    }
  },
  data () {
    return {
      loading: false,
      error: null,
      applicant: null,
      records: []

    }
  },

  mounted () {
    this.get_application()
  },
  methods: {
    see_application () {
      this.$router.push({ name: 'show_application', query: { id: this.application.identity.low } })
    },
    get_application () {
      this.loading = true
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application`, {
        params: { application_id: this.application.identity.low }
      })
        .then(response => {
          this.applicant = response.data[0]._fields[response.data[0]._fieldLookup['applicant']]
          this.records = response.data
        })
        .catch(() => this.error = 'Error getting application')
        .finally(() => this.loading = false)
    }
  },
  computed: {
    formatted_date () {
      let date = this.application.properties.creation_date
      return `${date.year.low}/${date.month.low}/${date.day.low}`
    },
    approval_count () {
      return this.records.reduce((count, record) => {
        let approval = record._fields[record._fieldLookup['approval']]
        if (approval) count++
        return count
      }, 0)
    },
    approval_percent () {
      return 100 * (this.approval_count / this.records.length)
    },
    next_approver () {
      let next_record = this.records.find(record => {
        let submission = record._fields[record._fieldLookup['submitted_to']]
        if (submission) return submission.properties.flow_index.low === this.approval_count
      })

      if (!next_record) return null
      return next_record._fields[next_record._fieldLookup['recipient']]
    }
  }
}
</script>

<style scoped>

</style>
