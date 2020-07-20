<template>
  <div class="application_table_container">

    <!-- list generated -->
    <div
      class=""
      v-for="state in states"
      v-bind:key="`${state.name}_wrapper`">
      <h2>{{state.heading}}</h2>

      <div
        class="error_message"
        v-if="application_records[state.name].error">
        Error loading applications
      </div>

      <template
        v-else-if="application_records[state.name].length > 0">

        <table
          class="application_table">

          <ApplicationTableHeaderRow
            v-bind:application_records="application_records[state.name]"/>

          <ApplicationTableRow
            v-for="(record, index) in application_records[state.name]"
            v-bind:key="`${state.name}_${index}`"
            v-bind:application_record="record"/>
        </table>
      </template>

      <div
        class="load_more_wrapper"
        v-if="!application_records[state.name].all_loaded">
        <button
          type="button"
          class="bordered"
          @click="$emit('load_more','approved')">
          Load more
        </button>
      </div>

      <Loader
        v-if="application_records[state.name].loading">
        Loading applications...
      </Loader>

      <div
        class=""
        v-if="application_records[state.name].length === 0 && !application_records[state.name].loading">
        No application
      </div>

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
    application_records: Object,
    hideApplicant: {
      type: Boolean,
      default () { return false }
    },
    hideRecipient: {
      type: Boolean,
      default () { return false }
    }
  },
  data(){
    return {
      states: [
        {
          name: 'pending',
          heading: '申請中 / Pending',
        },
        {
          name: 'rejected',
          heading: '却下 / Rejected',
        },
        {
          name: 'approved',
          heading: '承認 / Approved',
        },

      ]
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

.load_more_wrapper {
  margin: 1em;
  text-align: center;
}

</style>
