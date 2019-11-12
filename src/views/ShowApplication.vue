<template>
  <div>
    <div class="" v-if="applications.length > 0">
      <Application
        v-for="application in applications"
        v-bind:application="application"
        v-on:reload="get_application()"/>
    </div>

    <div v-else >
      Application does not exist
    </div>

  </div>
</template>

<script>
// @ is an alias to /src

import Application from '@/components/Application.vue'

import {parse_application_records} from '@/mixins/parse_application_records.js'


export default {
  name: 'ShowApplication',
  components: {
    Application,
  },
  mixins: [
    parse_application_records
  ],
  mounted(){
    this.get_application();
  },
  data(){
    return {
      applications: [],
    }

  },
  methods: {
    get_application(){
      this.axios.post('http://webhanko.mike.jtekt.maximemoreillon.com/get_application', {
        application_id: this.$route.query.id
      })
      .then(response => {
        this.parse_application_records(response.data.records)
        console.log(this.applications)
      })
      .catch(error => console.log(error));
    },
  }
}
</script>

<style scoped>



</style>
