<template>
  <div class="received applications">
    <ApplicationTableV2
      v-bind:applications="applications"
      hideRecipient
      />
  </div>
</template>

<script>
import ApplicationTableV2 from '@/components/ApplicationTableV2.vue'

export default {
  name: 'ReceivedApplications',
  components: {
    ApplicationTableV2,
  },
  data(){
    return {
      applications: {
        pending: [],
        rejected: [],
        approved: [],
      }
    }
  },
  mounted(){
    this.get_submitted_applications_pending();
    this.get_submitted_applications_approved();
    this.get_submitted_applications_rejected();
  },
  methods: {
    get_submitted_applications_pending(){
      this.$set(this.applications.pending, 'loading', true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/received_applications/pending`)
      .then(response => {
        this.applications.pending = []
        response.data.forEach(record => this.applications.pending.push(record._fields[record._fieldLookup['application']]))
      })
      .catch(error => this.$set(this.applications.pending, 'error', 'Error loading applications'))
    },
    get_submitted_applications_rejected(){
      this.$set(this.applications.rejected, 'loading', true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/received_applications/rejected`)
      .then(response => {
        this.applications.rejected = []
        response.data.forEach(record => this.applications.rejected.push(record._fields[record._fieldLookup['application']]))
      })
      .catch(error => this.$set(this.applications.rejected, 'error', 'Error loading applications'))
    },
    get_submitted_applications_approved(){
      this.$set(this.applications.approved, 'loading', true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/received_applications/approved`)
      .then(response => {
        this.applications.approved = []
        response.data.forEach(record => this.applications.approved.push(record._fields[record._fieldLookup['application']]))
      })
      .catch(error => this.$set(this.applications.approved, 'error', 'Error loading applications'))
    },

  },

}
</script>

<style scoped>

</style>
