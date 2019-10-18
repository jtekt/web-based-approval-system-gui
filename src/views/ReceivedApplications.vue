<template>
  <div>

    <div v-if="applications.length > 0">
      <ApplicationPreview v-for="application in applications" v-bind:application="application" />
    </div>
    <div v-else>
      No applications
    </div>



  </div>
</template>

<script>
// @ is an alias to /src
import ApplicationPreview from '@/components/ApplicationPreview.vue'

// Mixins
import {parse_application_records} from '@/mixins/parse_application_records.js'

export default {
  name: 'ReceivedApplications',
  components: {
    ApplicationPreview,
  },
  mixins: [
    parse_application_records,
  ],
  data(){
    return {
      applications: [],
    }
  },
  mounted(){
    this.get_received_applications();
  },
  methods: {

    get_received_applications(){
      this.applications.splice(0,this.applications.length);
      this.axios.post('http://172.16.98.151:9723/get_received_applications', {})
      .then(response => this.parse_application_records(response.data.records))
      .catch(error => console.log(error));
    },
  },
  computed: {
    employee_number() {
      return this.$store.state.employee_number
    },
  },
}
</script>

<style scoped>


</style>
