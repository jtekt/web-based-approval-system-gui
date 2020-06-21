<template>
  <div class="application_table_container">

    <div class="">
      <h2>申請中 / Pending</h2>

      <div class="" v-if="applications.pending.error">Error loading applications</div>
      <Loader v-else-if="applications.pending.loading">Loading applications...</Loader>
      <table class="application_table" v-else-if="applications.pending.length > 0">

        <ApplicationTableHeaderRow
          v-bind:hideApplicant="hideApplicant"
          v-bind:hideRecipient="hideRecipient"/>

        <ApplicationTableRow
          v-for="application in applications.pending"
          v-bind:application="application"
          v-bind:hideApplicant="hideApplicant"
          v-bind:hideRecipient="hideRecipient"/>
      </table>
      <div class="" v-else>No application</div>
    </div>

    <div class="">
      <h2>却下 / Rejected</h2>

      <div class="" v-if="applications.rejected.error">Error loading applications</div>
      <Loader v-else-if="applications.rejected.loading">Loading applications...</Loader>
      <table class="application_table" v-else-if="applications.rejected.length > 0">

        <ApplicationTableHeaderRow
          v-bind:hideApplicant="hideApplicant"
          v-bind:hideRecipient="hideRecipient"/>

        <ApplicationTableRow
          v-for="application in applications.rejected"
          v-bind:application="application"
          v-bind:hideApplicant="hideApplicant"
          v-bind:hideRecipient="hideRecipient"/>
      </table>
      <div class="" v-else>No application</div>

    </div>

    <div class="">
      <h2>承認 / Approved</h2>

      <div class="" v-if="applications.approved.error">Error loading applications</div>
      <Loader v-else-if="applications.approved.loading">Loading applications...</Loader>
      <table class="application_table" v-else-if="applications.approved.length > 0">

        <ApplicationTableHeaderRow
          v-bind:hideApplicant="hideApplicant"
          v-bind:hideRecipient="hideRecipient"/>

        <ApplicationTableRow
          v-for="application in applications.approved"
          v-bind:application="application"
          v-bind:hideApplicant="hideApplicant"
          v-bind:hideRecipient="hideRecipient"/>
      </table>
      <div class="" v-else>No application</div>

    </div>

  </div>
</template>

<script>
import ApplicationTableRow from '@/components/ApplicationTableRow.vue'
import ApplicationTableHeaderRow from '@/components/ApplicationTableHeaderRow.vue'

import Loader from '@moreillon/vue_loader'

export default {
  name: 'ApplicationTable',
  components: {
    Loader,
    ApplicationTableRow,
    ApplicationTableHeaderRow
  },
  props: {
    applications: Object,
    hideApplicant: {
      type: Boolean,
      default () { return false }
    },
    hideRecipient: {
      type: Boolean,
      default () { return false }
    }
  },
  methods: {
    see_application (application_id) {
      this.$router.push({ name: 'show_application', query: { id: application_id } })
    }
  }
}
</script>

<style>

.application_table{
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.application_table tr {
}

.application_table td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application_table td:not(:last-child) {
  padding-right: 1em;
}

.application_table .type_header {
  width: 30%;
}

.application_table .date_header {
  width: 10%;
}

.application_table .recipient_header, .application_table .applicant_header {
  width: 10%;
}

.application_table .progress_header {
  width: 10%;
}

/* border between table elements */
.application_table tr:not(.table_section_header_row):not(:last-child){
  border-bottom: 1px solid #dddddd;
}

.application_table .table_section_header_row{
  font-size: 120%;
}

/* Spacing between table sections */
.application_table .table_section_header_row:not(:first-child) th{
  padding-top: 50px;
}

.application_table tr:not(.headers_row):not(.table_section_header_row) {
  cursor: pointer;
  transition: background-color 0.25s;
}

.application_table tr:not(.headers_row):not(.table_section_header_row):hover {
  background-color: #eeeeee;
}

.application_table progress {
  width: 100%;
}

</style>
