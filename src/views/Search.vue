<template>
  <v-card>
    <v-card-title>{{ $t('Search') }}</v-card-title>
    <v-card-text>
      <v-card outlined>
        <v-card-title> {{ $t('Filters') }} </v-card-title>

        <v-form @submit.prevent="search()">
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('Stamp ID')"
                  v-model="hanko_id"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('Application ID')"
                  v-model="application_id"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-combobox
                  :label="$t('Application type')"
                  :items="application_types"
                  v-model="application_type"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <DatePickerMenu
                  label="いつから / From"
                  @selection="start_date = $event"/>
              </v-col>
              <v-col>
                <DatePickerMenu
                  label="いつまで / To"
                  @selection="end_date = $event"/>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="auto">
                {{ $t('Applicant') }}{{ $t('Group') }}
              </v-col>
              <v-col cols="auto">

                <v-chip
                  v-if="selected_group"
                  close
                  @click:close="selected_group = null">
                  {{selected_group.properties.name}}
                </v-chip>

                <AddGroupDialog
                  v-else
                  @selection="select_group($event)"/>

              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :label="$t('Relationship')"
                  :items="relationship_types"
                  v-model="relationship_type"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :label="$t('Approval state')"
                  :items="approval_states"
                  v-model="approval_state"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  type="submit">
                  <v-icon>mdi-magnify</v-icon>
                  <span>{{ $t('Search') }}</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-form>




      </v-card>
    </v-card-text>

    <v-card-text>
      <v-data-table
        :loading="loading"
        :items="applications"
        :headers="headers"
        :options.sync="options"
        :server-items-length="count"
        @click:row="row_clicked($event)">

      <template v-slot:item.properties.creation_date="{ item }">
        {{format_date(item.properties.creation_date)}}
      </template>

      </v-data-table>
    </v-card-text>


  </v-card>
</template>

<script>
import XLSX from 'xlsx'
import IdUtils from '@/mixins/IdUtils.js'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import DatePickerMenu from '@/components/DatePickerMenu.vue'

export default {
  name: 'Search',
  components: {
    AddGroupDialog,
    DatePickerMenu,
  },
  mixins: [
    IdUtils
  ],
  data () {
    return {
      loading: false,
      error: null,

      applications: [],
      options: {},

      headers: [
        // {text: this.$t('Application ID'), value: 'properties._id'},
        {text: this.$t('Date'), value: 'properties.creation_date'},
        {text: this.$t('Title'), value: 'properties.title'},
        {text: this.$t('Type'), value: 'properties.type'},
        {text: this.$t('Applicant'), value: 'applicant.properties.display_name'},
      ],

      application_types: [],
      application_type: null,
      count: null,

      // Filters
      // Todo: group under filters object
      application_id: null,
      hanko_id: null,
      relationship_types: [
        {value: null, text: '何でも / Any'},
        {value: 'SUBMITTED_BY', text: '出した申請 / Submitted by you'},
        {value: 'SUBMITTED_TO', text: '受け取った申請 / Submitted to you'},
        {value: 'REJECTED', text: '却下した申請 / Rejected by you'},
        {value: 'APPROVED', text: '承認した申請 / Approved by you'},
      ],
      relationship_type: null,

      approval_states: [
        {text: '何でも / Any', value: null},
        {text: '承認完了 / Approved', value: 'approved'},
      ],
      approval_state: null,

      field_labels: [],
      start_date: null,
      end_date: null,
      selected_group: null,

      modal_open: false,
    }
  },
  mounted () {
    this.get_application_types()
  },
  watch: {
    options: {
      handler () {
        this.search()
      },
      deep: true,
    },
  },
  methods: {
    get_application_types () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/types`
      this.axios.get(url)
        .then(({ data }) => { this.application_types = data })
        .catch(error => { console.error(error) })
    },
    get_applications () {

      this.loading = true
      this.error = false
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications`

      const { page, itemsPerPage } = this.options


      const params = {
        hanko_id: this.hanko_id,
        application_id: this.application_id,
        relationship: this.relationship_type,
        type: this.application_type,
        start_date: this.start_date,
        end_date: this.end_date,
        group_id: this.selected_group_id,
        state: this.approval_state,
        start_index: (page-1) * itemsPerPage,
        batch_size: itemsPerPage,
      }

      this.axios.get(url, { params })
        .then( ({data}) => {
          this.applications = data.applications
          this.count = data.count

          // Unpack form-data
          this.applications.forEach( application => {
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
        .catch(error => {
          console.log(error)
          this.error = error
         })
        .finally(() => { this.loading = false })

    },
    search () {
      this.field_labels = []
      this.get_applications()


    },
    select_group (group) {
      this.modal_open = false
      this.selected_group = group
    },
    row_clicked({properties: {_id}}){
      this.$router.push({name: 'application', params: {application_id: _id}})
    },
    export_table () {
      var workbook = XLSX.utils.book_new()
      var ws1 = XLSX.utils.table_to_sheet(document.getElementById('search_results_table'))
      XLSX.utils.book_append_sheet(workbook, ws1, 'Sheet1')
      XLSX.writeFile(workbook, 'export.xlsx')
    },
    format_date (date) {
      const { year, month, day } = date
      return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
    },
  },
  computed: {
    selected_group_id () {
      if (!this.selected_group) return null
      return this.get_id_of_item(this.selected_group)
    },
  }
}
</script>
