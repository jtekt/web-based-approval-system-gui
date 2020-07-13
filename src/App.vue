<template>
  <div id="app">
    <AppTemplate
      authenticate
      applicationName="電子承認システム">

      <template v-slot:navigation>
        <router-link :to="{ path: '/create_application', }"><plus-icon />New</router-link>
        <router-link :to="{ path: '/application_list/submitted', }"><inbox-arrow-up-icon />Outbox</router-link>
        <router-link :to="{ path: '/application_list/received', }"><inbox-arrow-down-icon />Inbox</router-link>
        <router-link :to="{ path: '/application_template_list', }"><file-settings-outline-icon />Forms</router-link>
        <router-link :to="{ path: '/search', }"><magnify-icon />Search</router-link>
        <router-link :to="{ path: '/about', }"><information-outline-icon />Info</router-link>
      </template>

    </AppTemplate>
  </div>
</template>

<script>
import AppTemplate from '@moreillon/vue_application_template_flex'

import PlusIcon from 'vue-material-design-icons/Plus.vue';
import InboxArrowUpIcon from 'vue-material-design-icons/InboxArrowUp.vue';
import InboxArrowDownIcon from 'vue-material-design-icons/InboxArrowDown.vue';
import FileSettingsOutlineIcon from 'vue-material-design-icons/FileSettingsOutline.vue';
import InformationOutlineIcon from 'vue-material-design-icons/InformationOutline.vue';
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';


export default {
  components: {
    AppTemplate,
    PlusIcon,
    InboxArrowUpIcon,
    InboxArrowDownIcon,
    FileSettingsOutlineIcon,
    InformationOutlineIcon,
    MagnifyIcon,
  },
}
</script>

<style>

* {
  box-sizing: border-box;
}

</style>
