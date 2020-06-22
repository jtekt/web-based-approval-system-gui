<template>
  <div>
    <h1>Info</h1>
    <h2>Bug report</h2>
    <p>If you find a bug or a problem, please report it on <a href="http://10.115.1.14/moreillon_k8s/shinsei_manager/-/issues">GitLab</a></p>

    <h2>Technologies used</h2>
    <p>This application is built using the following open-source technologies:</p>
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
    <h2>Source code</h2>
    <p>The source code for this system is available on the company's internal GitLab:</p>
    <ul>
      <li><a href="http://172.16.98.151:8081/moreillon_k8s/shinsei_manager">Back-end</a></li>
      <li><a href="http://172.16.98.151:8081/moreillon_k8s/shinsei_manager_front">Front-end</a></li>
    </ul>

  </div>
</template>

<script>

// UI elements

export default {
  name: 'About',
  data () {
    return {
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
  margin: 0.5em;
}

</style>
