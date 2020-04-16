<template>
  <div id="app">
    <AppTemplate
      applicationName="電子承認システム"
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

</style>
