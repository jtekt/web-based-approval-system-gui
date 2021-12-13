<template>
  <AppTemplate
    :options="options"
    @user="get_user($event)">

    <template v-slot:nav>
      <router-link :to="{ name: 'create_application'}"><plus-icon />New</router-link>
      <router-link :to="{ name: 'submitted_applications'}"><inbox-arrow-up-icon />Outbox</router-link>
      <router-link :to="{ name: 'received_applications'}"><inbox-arrow-down-icon />Inbox</router-link>
      <router-link :to="{ name: 'search'}"><magnify-icon />Search</router-link>
      <router-link :to="{ name: 'application_templates'}"><file-settings-outline-icon />Form templates</router-link>
      <router-link :to="{ name: 'info'}"><information-outline-icon />Info</router-link>
    </template>

  </AppTemplate>
</template>

<script>

import AppTemplate from '@moreillon/vue_application_template'

export default {
  name: 'App',
  components: {
    AppTemplate,
  },
  data(){
    return {
      options: {
        authenticate: true,
        title: '申請マネージャ',
        login_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL}/v2/auth/login`,
        identification_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL}/v2/users/self`,
      }
    }
  },
  methods: {
    get_user(user){
      this.$store.commit('set_current_user', user)
    }
  }
}
</script>

<style>
/* THIS CSS GETS OVERRIDDEN BY TEMPLATE! */

.material-design-icon__svg {
  bottom: 0 !important;
}

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
  //color: #dddddd;
  cursor: not-allowed;
  opacity: 0.25;
}

button .material-design-icon {
  font-size: 150%;
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
  //border-color: #dddddd;
}

.error_message, .error {
  color: #c00000;
}

.success {
  color: #00c000;
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

.growing_spacer {
  flex-grow: 1;
}

</style>
