<template>
  <v-card>
    <v-card-title class="text-h4">申請マネージャ (PDF専用GUI)</v-card-title>
    <v-card-text>
      An alternative GUI for 申請マネージャー dedicated to handling .pdf files. Developped and maintained by Maxime MOREILLON.
    </v-card-text>

    <v-card-text>
      <v-data-table
        hide-default-footer
        ref="export_table"
        :headers="headers"
        :items="services"/>
    </v-card-text>

  </v-card>
</template>

<script>
import pjson from '@/../package.json'

export default {
  name: 'About',
  data(){
    return {
      version: pjson.version,
      headers: [
        {text: 'Service', value: "name"},
        {text: 'Version', value: "version"},
        {text: 'URL', value: "url"},

      ],
      services: [
        {
          name: 'PDF Approval manager GUI',
          url: window.location.origin,
          version: pjson.version
        },
        {
          name: 'Shinsei manager API',
          url: process.env.VUE_APP_SHINSEI_MANAGER_URL,
          version: null
        },
        {
          name: 'Employee manager API',
          url: process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL,
          version: null
        },
        {
          name: 'Group manager API',
          url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
          version: null
        },
      ],
    }
  },
  mounted () {
    this.get_services_version()
  },
  methods: {

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
