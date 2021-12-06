<template>
  <AppTemplate
    :options="options"
    @user="$store.commit('set_current_user', $event)">

    <template v-slot:nav>
      <v-list
        dense
        nav >
        <v-list-item
          v-for="(item, index) in nav"
          :key="`nav_item_${index}`"
          :to="item.to"
          exact>
          <v-list-item-icon>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{item.title}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>

  </AppTemplate>
</template>

<script>
import AppTemplate from '@moreillon/vue_application_template_vuetify'
export default {
  name: 'App',

  components: {
    AppTemplate
  },

  data: () => ({
    options: {
      title: "申請マネージャー",
      authenticate: true,
      skip_greetings: process.env.NODE_ENV === 'development',
      login_url: `${process.env.VUE_APP_AUTHENTICATION_API_URL}/login`,
      identification_url: `${process.env.VUE_APP_AUTHENTICATION_API_URL}/v2/whoami`,
    },
    nav: [
      {title: '新規作成 / New', to: {name: 'new_application'}, icon: 'mdi-plus'},
      {title: '送信トレイ / Outbox', to: {name: 'submitted_applications'}, icon: 'mdi-inbox-arrow-up'},
      {title: '受信トレイ / Inbox', to: {name: 'received_applications'}, icon: 'mdi-inbox-arrow-down'},
      {title: 'アプリについて / About', to: {name: 'about'}, icon: 'mdi-information-outline'},
    ]
  }),

  methods: {

  }
}
</script>
