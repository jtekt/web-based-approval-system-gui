<template>
  <div id="app">
    <AppTemplate
      applicationName="申請マネージャー"
      v-bind:navigation="navigation"
      />
  </div>
</template>

<script>
import AppTemplate from '@moreillon/vue_application_template_flex'


export default {
  components: {
    AppTemplate
  },
  data(){
    return{
      navigation : [
        {route: '/', label: 'Outbox', icon: 'inbox-arrow-up'},
        {route: '/received_applications', label: 'Inbox', icon: 'inbox-arrow-down'},
        {route: '/application_template_list', label: 'Forms', icon: 'file-settings-outline'},
        {route: '/search', label: 'Search', icon: 'magnify'},
      ]
    }
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

.picker .node_container{
  margin: 0 !important;
  padding: 0 !important;
}

</style>
