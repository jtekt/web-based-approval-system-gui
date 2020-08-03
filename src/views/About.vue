<template>
  <div>
    <h1>Info</h1>
    <p>
      申請マネージャ / Shinsei manager version {{version}}
    </p>
    <p>
      Developped and maintained by <a href="https://maximemoreillon.com">Maxime MOREILLON</a>
    </p>
    <h2>Statistics</h2>
    <p>
      <span style="font-weight: bold;">{{application_count}}</span> Submitted applications forms
    </p>
    <h2>Technologies</h2>
    <p>
      This application is built using the following open-source technologies:
    </p>

    <div class="" class="tech_wrapper">
      <div
        class="tech"
        v-for="(tech, index) in technologies"
        v-bind:key="index">
        <img :src="tech.image_src" alt="">
        <label class="">
          {{tech.label}}
        </label>
      </div>
    </div>

    <h2>Bug report</h2>
    <p>
      If you find a bug or a problem, please report it on GitLab
    </p>



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
      version: pjson.version,
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
  },
  methods: {
    get_application_count(){
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/count`
      this.axios.get(url)
      .then((response) => {
        console.log(response.data)
        this.application_count = response.data.low
      })
      .catch(error => console.log(error))
    }
  }

}
</script>

<style scoped>
.tech_wrapper {
  margin: 2em;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.tech {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-basis: 10em;
}
.tech img {
  height: 5em;
}

.tech label {
  margin-top: 1em;
}

</style>
