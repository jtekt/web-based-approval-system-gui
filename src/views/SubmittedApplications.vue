<template>
  <div class="submitted_applications">



    <div class="new_button_wrapper">
      <IconButton
        v-on:clicked="create_new_application()"
        icon="mdi-plus"
        bordered>
        新しい申請</IconButton>
    </div>


    <div class="received applications">
      <ApplicationTableV2
        v-bind:applications="applications"
        hideApplicant/>
    </div>



  </div>
</template>

<script>
import ApplicationTableV2 from '@/components/ApplicationTableV2.vue'
import IconButton from '@/components/IconButton.vue'



export default {
  name: 'SubmittedApplications',
  components: {
    ApplicationTableV2,
    IconButton
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
    get_submitted_applications_pending(){
      this.$set(this.applications.pending, 'loading', true)
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_submitted_applications/pending', {})
      .then(response => {
        this.applications.pending = []
        response.data.forEach(record => this.applications.pending.push(record._fields[record._fieldLookup['application']]))
      })
      .catch(error => this.$set(this.applications.pending, 'error', 'Error loading applications'))
    },
    get_submitted_applications_rejected(){
      this.$set(this.applications.rejected, 'loading', true)
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_submitted_applications/rejected', {})
      .then(response => {
        this.applications.rejected = []
        response.data.forEach(record => this.applications.rejected.push(record._fields[record._fieldLookup['application']]))
      })
      .catch(error => this.$set(this.applications.rejected, 'error', 'Error loading applications'))
    },
    get_submitted_applications_approved(){
      this.$set(this.applications.approved, 'loading', true)
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_submitted_applications/approved', {})
      .then(response => {
        this.applications.approved = []
        response.data.forEach(record => this.applications.approved.push(record._fields[record._fieldLookup['application']]))
      })
      .catch(error => this.$set(this.applications.approved, 'error', 'Error loading applications'))
    },

    create_new_application(){
      this.$router.push({ name: 'create_application' })
    },

  }
}
</script>

<style scoped>

.new_button_wrapper{
  text-align: center;
  padding: 15px;
}


</style>
