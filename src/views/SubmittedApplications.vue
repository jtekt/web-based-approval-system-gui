<template>
  <div class="submitted_applications">

    <h3>Pending</h3>
    <ApplicationTable v-bind:applications="applications.pending"/>

    <h3>Rejected</h3>
    <ApplicationTable v-bind:applications="applications.rejected"/>

    <h3>Approved</h3>
    <ApplicationTable v-bind:applications="applications.approved"/>

  </div>
</template>

<script>
import ApplicationTable from '@/components/ApplicationTable.vue'

export default {
  name: 'SubmittedApplications',
  components: {
    ApplicationTable
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
    this.get_all_submitted_applications();
  },
  methods: {
    get_all_submitted_applications(){
      this.get_submitted_applications_pending();
      this.get_submitted_applications_approved();
      this.get_submitted_applications_rejected();
    },
    get_submitted_applications_rejected(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_submitted_applications/rejected', {})
      .then(response => this.applications.rejected = response.data.records)
      .catch(error => console.log(error))
    },
    get_submitted_applications_approved(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_submitted_applications/approved', {})
      .then(response => this.applications.approved = response.data.records)
      .catch(error => console.log(error))
    },
    get_submitted_applications_pending(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_submitted_applications/pending', {})
      .then(response => this.applications.pending = response.data.records)
      .catch(error => console.log(error))
    },

  }
}
</script>

<style scoped>





</style>
