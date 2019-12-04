<template>
  <div class="submitted_applications">
    <ApplicationTableV2 v-bind:applications="applications" hideApplicant/>
  </div>
</template>

<script>
import ApplicationTableV2 from '@/components/ApplicationTableV2.vue'

export default {
  name: 'SubmittedApplications',
  components: {
    ApplicationTableV2
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
