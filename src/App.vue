<template>
  <AppTemplate
    :options="options"
    @user="$store.commit('set_current_user', $event)">

    <template v-slot:nav>
      <v-list
        dense
        nav >
        <v-list-item>
          <LocaleSelector />
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="(item, index) in nav"
          :key="`nav_item_${index}`"
          :to="item.to"
          exact>

          <v-list-item-icon>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              <v-badge
                v-if="item.count"
                :content="item.count"
                color="#c00000">
                {{item.title}}
              </v-badge>
              <span v-else>{{item.title}}</span>

            </v-list-item-title>

          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>

  </AppTemplate>
</template>

<script>
import AppTemplate from '@moreillon/vue_application_template_vuetify'
import LocaleSelector from './components/LocaleSelector.vue'
export default {
  name: 'App',

  components: {
    AppTemplate,
    LocaleSelector
  },


  data(){
    return {
      
      options: {
        title: "申請マネージャー",
        skip_greetings: process.env.NODE_ENV === 'development',
        login_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL}/v2/auth/login`,
        identification_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_API_URL}/v2/users/self`,
        password_reset_url: `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/password_reset`,
      },

    }
  },
  computed: {
    nav(){
      return [
        {title: this.$t('nav.new'), to: {name: 'new_application'}, icon: 'mdi-plus'},
        {title: this.$t('nav.outbox'), to: {name: 'submitted_applications'}, icon: 'mdi-inbox-arrow-up'},
        {title: this.$t('nav.inbox'), to: {name: 'received_applications'}, icon: 'mdi-inbox-arrow-down', count: this.$store.state.received_pending_application_count},
        {title: this.$t('nav.search'), to: {name: 'search'}, icon: 'mdi-magnify'},
        {title: this.$t('nav.templates'), to: {name: 'templates'}, icon: 'mdi-file-document-multiple-outline'},
        {title: this.$t('nav.about'), to: {name: 'about'}, icon: 'mdi-information-outline'},
      ]
    }
  }

}
</script>

<i18n>
{
  "en": {
    "nav": {
      "new": "New application",
      "outbox": "Outbox",
      "inbox": "Inbox",
      "search": "Search",
      "templates": "Templates",
      "about": "About"
    }
  },
  "ja": {
    "nav": {
      "new": "新規作成",
      "outbox": "送信トレイ",
      "inbox": "受信トレイ",
      "search": "検索",
      "templates": "テンプレート",
      "about": "アプリについて"
    }
  }

}
</i18n>