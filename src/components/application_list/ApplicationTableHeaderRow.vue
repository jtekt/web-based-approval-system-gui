<template>

  <tr class="headers_row">
    <th class="date_header">
      <calendar-icon/>
    </th>
    <th class="type_header">
      Type
    </th>
    <th class="title_header">
      Title
    </th>
    <th
      class="applicant_header"
      v-if="show_applicant">
      <account-icon />
    </th>
    <th
      class="recipient_header"
      v-if="show_next_recipient">
      <account-check-icon/>
    </th>
    <th
      class="progress_header"
      v-if="show_progress" >
      <percent-icon />
    </th>

  </tr>

</template>

<script>
import CalendarIcon from 'vue-material-design-icons/Calendar.vue'
import AccountIcon from 'vue-material-design-icons/Account.vue'
import AccountCheckIcon from 'vue-material-design-icons/AccountCheck.vue'
import PercentIcon from 'vue-material-design-icons/Percent.vue'

export default {
  name: 'ApplicationTableHeaderRow',
  props: {
    application_records: Array
  },
  components: {
    CalendarIcon,
    PercentIcon,
    AccountIcon,
    AccountCheckIcon

  },
  computed: {
    show_progress () {
      // Show progress if one or more application has a defined approval_count
      return this.application_records.find(record => {
        return typeof (record._fields[record._fieldLookup['approval_count']]) !== 'undefined'
      })
    },
    show_applicant () {
      return this.application_records.find(record => {
        return typeof (record._fields[record._fieldLookup['applicant']]) !== 'undefined'
      })
    },
    show_next_recipient () {
      return this.application_records.find(record => {
        return typeof (record._fields[record._fieldLookup['next_recipient']]) !== 'undefined'
      })
    }
  }
}
</script>

<style scoped>

</style>
