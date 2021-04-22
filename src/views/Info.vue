<template>
  <div>
    <h1>申請マネージャ / Shinsei manager</h1>
    <p>
      A web-based application form approval system developped and maintained by <a href="https://maximemoreillon.com">Maxime MOREILLON</a>
    </p>

    <h2>使い方について / Usage notice</h2>
    <p>現在、申請マネージャをEdge上でご使用になる場合PDF表示がおかしくなるようです。</p>
    <ul>
      <li>FirefoxおよびChromeでは正常に表示されます</li>
      <li>Edgeの場合は、PDFをダウンロードして頂き内容をご確認後、申請マネージャーの押印機能をご利用ください</li>
    </ul>
    <p>※表示がおかしくても、「電子印の押印→PDFのダウンロード」で正常に押印済PDFが取得できます</p>
    <p>This application is not compatible with Internet Explorer or the legacy version of Microsoft Edge.</p>

    <h2>Usage statistics</h2>
    <p>
      <span style="font-weight: bold;">{{application_count}}</span> Submitted applications forms
    </p>

    <h2>Services</h2>
    <table>
      <tr>
        <th>Service</th>
        <th>Version</th>
        <th>URL</th>
      </tr>
      <tr
        v-for="(service, index) in services"
        :key="`service_${index}`">
        <td>{{service.name}}</td>
        <td>{{service.version}}</td>
        <td>{{service.url}}</td>
      </tr>
    </table>

    <h2>技術 / Technologies</h2>
    <p>
      申請マネージャはこちらのOSS技術で作られました。
    </p>
    <p>
      This application is built using the following open-source technologies:
    </p>

    <div class="tech_wrapper">
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

      services: [
        {
          name: 'Shinsei manager GUI',
          url: window.location.origin,
          version: pjson.version
        },
        {
          name: 'Shinsei manager API',
          url: process.env.VUE_APP_SHINSEI_MANAGER_URL,
          version: null
        },
        {
          name: 'Group manager API',
          url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
          version: null
        },
        {
          name: 'Authentication API',
          url: process.env.VUE_APP_AUTHENTICATION_API_URL,
          version: null
        }
      ],

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
  mounted () {
    this.get_application_count()
    this.get_services_version()
  },
  methods: {
    get_application_count () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/count`
      this.axios.get(url)
        .then(({ data }) => { this.application_count = data.application_count })
        .catch(error => { console.log(error) })
    },
    get_services_version () {
      this.services.forEach((service) => {
        if (service.version) return
        service.version = 'Connecting...'
        this.axios.get(service.url)
          .then(({ data }) => { service.version = data.version })
          .catch(() => { service.version = 'Unable to connect' })
      })
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

th {
  text-align: left;
}
td {
  padding: 0.25em;
}

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
