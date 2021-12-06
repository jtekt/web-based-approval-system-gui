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

    <template v-slot:item.properties.creation_date="{ item }">
      <span>{{format_date_neo4j(item.properties.creation_date)}}</span>
    </template>

    <template v-slot:item.progress="{ item }">
      <v-progress-linear :value="item.progress"/>
    </template>


  </v-data-table>

</template>

<script>

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
            {text: 'Title', value: 'properties.title'},
          ]
        }
      }
    },
    data(){
      return {
        loading: false,
        options: {},
        applications: [],
        application_count: 0,
        error: null,

      }
    },

    components: {
    },
    mounted(){

      this.get_application_count()
    },
    watch: {
      options: {
        handler () {
          this.get_applications()
        },
        deep: true,
      },
      direction(){
        this.get_application_count()
      }
    },
    methods: {
      get_application_count(){
        this.loading = true

        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${this.direction}/${this.state}/count`

        this.axios.get(url)
        .then( ({data}) => {
          this.application_count = data.application_count
          this.get_applications()
        })
        .catch((error) => {
          console.error(error)
          this.error = error
        })
      },
      format_date_neo4j(date){
        return `${date.year}/${date.month}/${date.day}`
      },
      get_applications(){
        this.loading = true


        this.applications = []

        const direction = this.direction

        const state = this.state

        const { page, itemsPerPage } = this.options

        const params = {
          start_index: (page-1) * itemsPerPage,
          batch_size: itemsPerPage,
          type: this.type,
        }

        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${direction}/${state}`

        this.axios.get(url, {params})
        .then( ({data}) => {
          this.applications = data
          this.applications.forEach((application) => {

            application.current_recipient = application.recipients
              .slice()
              .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
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
        this.$router.push({name: 'application', params: {application_id: application.identity}})
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
