<template>
  <div class="received applications">
    <h1 v-if="$route.params.type === 'received'">受け取った申請 / Received applications</h1>
    <h1 v-else-if="$route.params.type === 'submitted'">出した申請 / Submitted applications</h1>

    <ApplicationTableV2
      v-bind:applications="applications"
      hideRecipient/>
  </div>
</template>

<script>
import ApplicationTableV2 from '@/components/ApplicationTableV2.vue'

export default {
  name: 'ApplicationList',
  components: {
    ApplicationTableV2
  },
  data () {
    return {
      applications: {
        pending: [],
        rejected: [],
        approved: []
      }
    }
  },
  mounted () {
    this.get_applications()
  },
  beforeRouteUpdate (_, __, next) {
    next()
    this.$nextTick()
    .then(() => {
      this.get_applications()
    })
  },

  methods: {
    get_applications(){
      let application_direction = this.$route.params.type
      let application_states = ['pending', 'rejected', 'approved']

      application_states.forEach((state) => {

        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${application_direction}/${state}`

        this.$set(this.applications[state], 'loading', true)
        this.axios.get(url)
        .then(response => {
          this.applications[state] = []
          response.data.forEach(record => {
            let application_node = record._fields[record._fieldLookup['application']]
            this.applications[state].push(application_node)
          })
        })
        .catch(error => this.$set(this.applications[state], 'error', 'Error loading applications'))
      })
    },
  }
}
</script>

<style scoped>

</style>
