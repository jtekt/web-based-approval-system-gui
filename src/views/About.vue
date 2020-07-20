<template>
  <div>
    <h1>Info</h1>
    <p>
      申請マネージャ / Shinsei manager version {{version}}
    </p>
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
