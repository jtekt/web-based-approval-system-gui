<template>
  <div>
    <h1>Info</h1>

    <h2>Versions</h2>
    <table>

      <tr>
        <td>Front end version</td>
        <td>{{version}}</td>
      </tr>
      <tr>
        <td>Back end version</td>
        <td>{{back_end_version}}</td>
      </tr>
    </table>

    <h2>APIs</h2>
    <table>

      <tr>
        <td>Shinsei manager</td>
        <td>{{apis.shinsei_manager}}</td>
      </tr>
      <tr>
        <td>Group manager</td>
        <td>{{apis.group_manager}}</td>
      </tr>
      <tr>
        <td>Authentication manager</td>
        <td>{{apis.authentication_manager}}</td>
      </tr>
    </table>





  </div>
</template>

<script>

// UI elements
import pjson from '@/../package.json'
export default {
  name: 'About',
  data () {
    return {
      application_count: null,
      back_end_version: null,
      version: pjson.version,

      apis: {
        shinsei_manager: process.env.VUE_APP_SHINSEI_MANAGER_URL,
        group_manager: process.env.VUE_APP_GROUP_MANAGER_API_URL,
        authentication_manager: process.env.VUE_APP_AUTHENTICATION_API_URL

      },
      technologies: [
        {
          label: 'Docker',
          image_src: require('@/assets/docker.png')
        },
        {
          label: 'Kubernetes',
          image_src: require('@/assets/kubernetes.png')
        },
        {
          label: 'Neo4J',
          image_src: require('@/assets/neo4j.png')
        },
        {
          label: 'Node.js',
          image_src: require('@/assets/nodejs.png')
        },
        {
          label: 'GitLab',
          image_src: require('@/assets/gitlab.png')
        },
        {
          label: 'Vue.js',
          image_src: require('@/assets/vue.png')
        }

      ]
    }
  },
  mounted(){
    this.get_application_count()
    this.get_back_end_version()
  },
  methods: {
    get_application_count(){
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/count`
      this.axios.get(url)
      .then((response) => {
        this.application_count = response.data.low
      })
      .catch(error => console.log(error))
    },
    get_back_end_version(){
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/`
      this.axios.get(url)
      .then((response) => {
        this.back_end_version = response.data.version
      })
      .catch(error => console.log(error))
    }
  }

}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

}

tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}
td {
  padding: 0.25em;
}

</style>
