<template>
  <div id="app">
    <AppTemplate
      applicationName="申請マネージャー"
      v-bind:navigation="navigation"
      />
  </div>
</template>

<script>
import AppTemplate from '@/components/jtekt_vue_template/AppTemplate.vue'


export default {
  components: {
    AppTemplate
  },
  data(){
    return{
      navigation : [
        {route: '/create_application', label: 'New', icon: 'file-document-box-plus-outline'},
        {route: '/', label: 'Outbox', icon: 'inbox-arrow-up'},
        {route: '/received_applications', label: 'Inbox', icon: 'inbox-arrow-down'},
      ]
    }
  }
}
</script>

<style>

</style>
