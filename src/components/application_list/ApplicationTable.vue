<template>
  <div class="">
    <h2>{{title}} ({{count}})</h2>

    <table
      v-if="applications.length && !error"
      class="application_table">

      <tr>
        <th class="date_header"><calendar-icon/></th>
        <th class="type_header">Type</th>
        <th class="title_header">Title</th>

        <th
          class="applicant_header"
          v-if="options.show_applicant">
          <account-icon />
        </th>

        <th
          class="recipient_header"
          v-if="options.show_next_recipient">
          <account-check-icon/>
        </th>
        <th
          class="progress_header"
          v-if="options.show_progress" >
          <percent-icon />
        </th>
      </tr>

      <ApplicationTableRow
        v-for="(application) in applications"
        :key="application.identity"
        :application="application"
        :options="options"/>


    </table>



    <div
      class="loader_wrapper"
      v-if="loading && !error">
      <Loader />
    </div>

    <div
      class=""
      v-if="!loading && !applications.length && !error">
      No applications
    </div>

    <div
      class="error"
      v-if="!loading && error">
      Failed to query applications
    </div>

    <div
      v-if="!all_loaded && !loading && !error"
      class="load_more_wrapper">
      <button
        type="button"
        class="bordered"
        @click="get_applications()">
        Load more
      </button>
    </div>



  </div>
</template>

<script>
import ApplicationTableRow from './ApplicationTableRow.vue'
import DateFormatting from '@/mixins/DateFormatting.js'

export default {
  name: 'ApplicationTable',
  mixins: [
    DateFormatting
  ],
  components: {
    ApplicationTableRow,
    // ApplicationTableHeaderRow
  },
  props: {
    direction: String,
    title: String,
    state: String,
    options: {type:Object, default: () => ({})},

  },
  data () {
    return {
      loading: false,
      count: null,
      error: null,
      applications: [],
      relationship_lookup: {
        'submitted': 'SUBMITTED_BY',
        'received': 'SUBMITTED_TO'
      },
    }
  },
  mounted(){
    this.applications = []
    this.get_applications()
  },
  watch: {
    direction () {
      this.applications = []
      this.get_applications()
    }
  },
  methods: {
    see_application (application_id) {
      this.$router.push({ name: 'show_application', query: { id: application_id } })
    },
    get_applications(){
      this.loading = true

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v3/applications`

      const params = {
        relationship: this.relationship_lookup[this.direction],
        state: this.state,
        batch_size: 10,
        start_index: this.applications.length,
      }

      this.axios.get(url, {params})
      .then( ({data}) => {
        this.applications = [...this.applications,...data.applications]
        this.count = data.count
      })
      .catch((error) => {
        console.error(error)
        this.error = error
      })
      .finally(() => { this.loading = false})
    },

  },
  computed: {
    all_loaded(){
      return this.applications.length === this.count
    }
  }
}
</script>

<style>

h2 {
  display: flex;
  align-items: center;
}


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

.application_table .recipient_header,
.application_table .applicant_header {
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


.loader_wrapper{
  font-size: 150%;
  text-align: center;
}
.load_more_wrapper {
  margin: 1em;
  text-align: center;
}


</style>
