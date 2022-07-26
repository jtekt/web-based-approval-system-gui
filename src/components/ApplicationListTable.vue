<template>

  <v-data-table
    disable-sort
    :loading="loading"
    :items="applications"
    :headers="headers"
    :options.sync="options"
    :server-items-length="application_count"
    @click:row="row_clicked($event)">

    <!-- <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{title}}</v-toolbar-title>
      </v-toolbar>
    </template> -->

    <template
      v-slot:body
      v-if="error">
      <div class="error_message">An error occured while loading data</div>
    </template>

    <template v-slot:item.creation_date="{ item }">
      <span>{{format_date_neo4j(item.creation_date)}}</span>
    </template>

    <template v-slot:item.progress="{ item }">
      <v-progress-linear :value="item.progress"/>
    </template>


  </v-data-table>

</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'ApplicationListTable',
  props: {
    direction: String,
    state: String,
    title: String,
    headers: {
      type: Array,
      default(){
        return [
          { text: 'Title', value: 'properties.title' },
        ]
      }
    }
  },
  mixins: [
    IdUtils
  ],
  data(){
    return {
      loading: false,
      options: {},
      applications: [],
      application_count: 0,
      error: null,
      relationship_lookup: {
        'submitted': 'SUBMITTED_BY',
        'received': 'SUBMITTED_TO'
      },

    }
  },

  components: {
  },
  mounted(){
    this.get_applications()
  },
  watch: {
    options: {
      handler () {
        this.get_applications()
      },
      deep: true,
    },
    direction(){
      this.get_applications()
    }
  },
  methods: {

    format_date_neo4j(date){
      return `${date.year}/${date.month}/${date.day}`
    },
    get_applications(){
      this.loading = true


      this.applications = []

      const { page, itemsPerPage } = this.options

      const params = {
        start_index: (page-1) * itemsPerPage,
        batch_size: itemsPerPage,
        type: this.type,
        relationship: this.relationship_lookup[this.direction],
        state: this.state,
      }

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications`

      this.axios.get(url, {params})
      .then( ({data}) => {

        this.applications = data.applications
        this.application_count = data.count
        this.applications.forEach((application) => {

          // Adding current recipient and progress to application
          // This should better be done somewhere else

          application.current_recipient = application.recipients
            .slice()
            .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
            .find(recipient => !recipient.approval)

          application.progress = 100 * application.recipients.filter(recipient => recipient.approval).length / application.recipients.length

        })

      })
      .catch((error) => {
        console.error(error)
        this.error = error
      })
      .finally(() => { this.loading = false})


    },
    row_clicked(application){
      const application_id = this.get_id_of_item(application)
      this.$router.push({name: 'application', params: {application_id}})
    }

  }
}
</script>


<style scoped>
.error_message {
  padding: 0.5em;
  color: #c00000;
}
</style>
