<template>

  <div v-if="applications.length > 0">
    <ApplicationPreview v-for="application in applications" v-bind:application="application" />
  </div>
  <div v-else>
    No applications
  </div>

</template>

<script>
// @ is an alias to /src
import ApplicationPreview from '@/components/ApplicationPreview.vue'


// Mixins
import {parse_application_records} from '@/mixins/parse_application_records.js'


export default {
  name: 'SubmittedApplications',
  components: {
    ApplicationPreview,

  },
  mixins: [
    parse_application_records
  ],
  data: function(){
    return {
      applications: [],
    }
  },
  mounted: function(){
    this.get_submitted_applications();
  },
  methods: {
    get_submitted_applications(){
      this.axios.post('http://172.16.98.151:9723/get_submitted_applications', {})
      .then(response => this.parse_application_records(response.data.records))
      .catch(error => console.log(error))
    },
  }
}
</script>

<style scoped>



</style>
