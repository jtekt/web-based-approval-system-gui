<template>
  <div class="">
    <h1>検索 / Search</h1>

    <h2>Filters</h2>

    <form @submit.prevent="search()">
      <table
        class="filters_table">
        <tr>
          <td>ハンコ ID / Hanko ID</td>
          <td>
            <input type="search" v-model="hanko_id" placeholder="ハンコ ID / Hanko ID">
          </td>
        </tr>
        <tr>
          <td>申請 ID / Application ID</td>
          <td>
            <input type="search" v-model="application_id" placeholder="申請 ID / Application ID">
          </td>
        </tr>
        <tr>
          <td>申請タイプ / Application type</td>
          <td>
            <input type="search" v-model="application_type" placeholder="申請タイプ / Application type">
          </td>
        </tr>
        <tr>
          <td>いつから / From</td>
          <td>
            <input type="date" v-model="start_date">
          </td>
        </tr>
        <tr>
          <td>いつまで / To</td>
          <td>
            <input type="date" v-model="end_date">
          </td>
        </tr>
        <tr>
          <td>関係 / Relationship</td>
          <td>
            <select class="" v-model="relationship_type">
              <option :value="null">何でも / Any</option>
              <option value="SUBMITTED_BY">出した申請 / Submitted by you</option>
              <option value="SUBMITTED_TO">受け取った申請 / Submitted to you</option>
              <option value="REJECTED">却下した申請 / Rejected by you</option>
              <option value="APPROVED">承認した申請 / Approved by you</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>申請者のグループ / Applicant group</td>
          <td>

            <button
              v-if="!selected_group"
              type="button"
              @click="modal_open = true">
              <account-multiple-plus-icon />
              <span>Select a group</span>
            </button>

            <div
              v-else
              class="selected_group_wrapper">
              <span>{{selected_group.properties.name}}</span>
              <button type="button" @click="selected_group = null">
                <close-icon />
              </button>
            </div>
          </td>
        </tr>

      </table>

      <input type="submit" class="hidden">
      <button
        type="button"
        class="bordered search_button"
        @click="search()">
        <magnify-icon/>
        <span>検索 / Search</span>
      </button>

    </form>

    <h2>Results</h2>

    <div
      v-if="loading"
      class="loader_container">
      <Loader>Searching...</Loader>
    </div>

    <template
      v-if="!loading && application_records.length > 0">

      <div class="export_button_wrapper">
        <button
          class="bordered"
          type="button"
          @click="export_table()">
          <download-icon/>
          <span>エクスポート / Export</span>
        </button>
      </div>

      <div class="table_wrapper">
        <table
          class="search_results_table"
          id="search_results_table">
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Type</th>
            <th>Title</th>
            <th>Confidential</th>
            <th>Applicant</th>
            <th
              v-for="(label, i) in field_labels"
              :key="`field_label_${i}`">
              {{label}}
            </th>
          </tr>

          <SearchResult
            v-for="(record, i) in application_records"
            v-bind:key="`result_${i}`"
            :record="record"
            :fields="field_labels"/>

        </table>
      </div>
    </template>

    <div
      v-if="!loading && application_records.length === 0"
      class="">
      No results
    </div>

    <!-- Modal for group visibility -->
    <Modal
      :open="modal_open"
      @close="modal_open=false">
      <h2 class="">
        Select a group
      </h2>
      <div
        v-if="modal_open"
        class="group_picker_wrapper">
        <GroupPicker
          class="visibility_group_picker"
          v-on:selection="select_group($event)"/>
      </div>
    </Modal>

  </div>

</template>

<script>
import SearchResult from '@/components/SearchResult.vue'
import XLSX from 'xlsx'
import GroupPicker from '@moreillon/vue_group_picker'
import Modal from '@moreillon/vue_modal'

export default {
  name: 'Search',
  components: {
    SearchResult,
    Modal,
    GroupPicker

  },
  data () {
    return {
      loading: false,
      application_records: [],

      // Filters
      application_id: null,
      hanko_id: null,
      relationship_type: null,
      application_type: null,

      field_labels: [],
      start_date: null,
      end_date: null,
      selected_group: null,

      modal_open: false
    }
  },
  methods: {
    search () {
      this.loading = true
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/search`
      this.axios.get(url, {
        params: {
          hanko_id: this.hanko_id,
          application_id: this.application_id,
          relationship_type: this.relationship_type,
          application_type: this.application_type,
          start_date: this.start_date,
          end_date: this.end_date,
          group_id: this.selected_group_id
        }
      })
        .then(response => {
          this.application_records = []
          this.field_labels = []
          response.data.forEach((record) => {
            this.application_records.push(record)
            let application = record._fields[record._fieldLookup.application]

            // Form data
            if (!application.properties.form_data) return
            let form_data = JSON.parse(application.properties.form_data)
            if (!Array.isArray(form_data)) return
            form_data.forEach((field) => {
              if (!this.field_labels.includes(field.label) && field.type !== 'file') {
                this.field_labels.push(field.label)
              }
            })
          })
        })
        .catch(error => { console.log(error) })
        .finally(() => { this.loading = false })
    },
    select_group (group) {
      this.modal_open = false
      this.selected_group = group
    },
    export_table () {
      var workbook = XLSX.utils.book_new()
      var ws1 = XLSX.utils.table_to_sheet(document.getElementById('search_results_table'))
      XLSX.utils.book_append_sheet(workbook, ws1, 'Sheet1')
      XLSX.writeFile(workbook, 'export.xlsx')
    }
  },
  computed: {
    selected_group_id () {
      if (!this.selected_group) return null
      else return this.selected_group.identity.low || this.selected_group.identity
    }
  }
}
</script>

<style scoped>
form {
  text-align: center;
}
form > * {
  margin: 0.25em;
}

.search_button {
  margin-top: 1em;
}
.table_wrapper {
  overflow: auto;
  max-height: 70vh;
}

table {
  border-collapse: collapse;
  min-width: 100%;
  text-align: left;
}

table input, table select {
  width: 100%;
}

.search_results_table th {
  max-width: 20em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.search_results_table th:not(:last-child) {
  padding-right: 1em;
}

tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.search_results_table tr:not(:first-child) {
  cursor: pointer;
  transition: background-color 0.25s;
}

.search_results_table tr:not(:first-child):hover {
  background-color: #eeeeee;
}

.export_button_wrapper {
  margin: 1em;
  text-align: center;
}

.loader_container {
  text-align: center;
}

.hidden {
  display: none;
}

.selected_group_wrapper {
  display: flex;
  align-items: center;
}

.group_picker_wrapper {
  height: 50vh;
  width: 75vw;
}

.visibility_group_picker {
  height: 100%;
}

</style>
