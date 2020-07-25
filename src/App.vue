<template>
  <div id="app">
    <AppTemplate
      authenticate
      applicationName="申請マネージャー">

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

button {
  border: none;
  background-color: transparent;
  color: black;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: color 0.25s, border-color 0.25s;
}

button:hover{
  color: #c00000;
}

button:disabled {
  color: #dddddd;
  cursor: not-allowed;
}

button > *:not(:last-child) {
  margin-right: 0.25em;
}

button.bordered {
  border: 1px solid black;
  border-radius: 5px;
  padding: 0.25em 0.5em;
}

button.bordered:hover {
  border-color: #c00000;
}

button.bordered:disabled {
  border-color: #dddddd;
}

.error_message {
  color: #c00000;
}

main a {
  color: currentColor;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.25s;
}

main a:hover {
  color: #c00000;
}

.confidential {
  border: 1px solid #c00000;
  border-radius: 0.25em;
  color: #c00000;
  padding: 0.25em;
  margin: 0.25em;
}

.confidential::after {
  content: "秘密 / Secret";
}

</style>
