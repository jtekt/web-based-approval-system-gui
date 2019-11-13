<template>
  <div class="received applications">


    <h3>Pending</h3>
    <ApplicationTable v-bind:applications="applications.pending"/>

    <h3>Rejected</h3>
    <ApplicationTable v-bind:applications="applications.rejected"/>

    <h3>Approved</h3>
    <ApplicationTable v-bind:applications="applications.approved"/>

  </div>
</template>

<script>
// @ is an alias to /src
import ApplicationTable from '@/components/ApplicationTable.vue'



export default {
  name: 'ReceivedApplications',
  components: {
    ApplicationTable,
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
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_received_applications/rejected', {})
      .then(response => this.applications.rejected = response.data.records)
      .catch(error => console.log(error))
    },
    get_submitted_applications_approved(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_received_applications/approved', {})
      .then(response => this.applications.approved = response.data.records)
      .catch(error => console.log(error))
    },
    get_submitted_applications_pending(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_received_applications/pending', {})
      .then(response => this.applications.pending = response.data.records)
      .catch(error => console.log(error))
    },

  },

}
</script>

<style scoped>


</style>
