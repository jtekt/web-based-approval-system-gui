<template>
  <AppTemplate :options="options" @user="user_changed($event)">
    <template v-slot:nav>
      <v-list dense nav>
        <v-list-item>
          <LocaleSelector />
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="(item, index) in nav"
          :key="`nav_item_${index}`"
          :to="item.to"
          exact
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>
              <v-badge v-if="item.count" :content="item.count" color="#c00000">
                {{ item.title }}
              </v-badge>
              <span v-else>{{ item.title }}</span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </AppTemplate>
</template>

<script>
import AppTemplate from "@moreillon/vue_application_template_vuetify"
import LocaleSelector from "./components/LocaleSelector.vue"
export default {
  name: "App",

  components: {
    AppTemplate,
    LocaleSelector,
  },

  data() {
    return {
      options: {
        title: "申請マネージャー",
        skip_greetings: process.env.NODE_ENV === "development",
        login_url: process.env.VUE_APP_LOGIN_URL,
        identification_url: process.env.VUE_APP_IDENTIFICATION_URL,
        password_reset_url: process.env.VUE_APP_PASSWORD_RESET_URL,

        header_logo: require("@/assets/jtekt_logo_negative.jpg"),
        authentication_logo: require("@/assets/jtekt_logo.jpg"),
        colors: { app_bar: "#000" },
        author: "Maxime Moreillon - JTEKT Corporation",
      },
    }
  },
  methods: {
    user_changed(user) {
      this.$store.commit("set_current_user", user)
      this.$store.commit("check_pending_applications")
    },
  },
  computed: {
    nav() {
      return [
        {
          title: this.$t("New application"),
          to: { name: "new_application" },
          icon: "mdi-plus",
        },
        {
          title: this.$t("Outbox"),
          to: { name: "submitted_applications" },
          icon: "mdi-inbox-arrow-up",
        },
        {
          title: this.$t("Inbox"),
          to: { name: "received_applications" },
          icon: "mdi-inbox-arrow-down",
          count: this.$store.state.received_pending_application_count,
        },
        {
          title: this.$t("Search"),
          to: { name: "search" },
          icon: "mdi-magnify",
        },
        {
          title: this.$t("Templates"),
          to: { name: "templates" },
          icon: "mdi-file-document-multiple-outline",
        },
        {
          title: this.$t("About"),
          to: { name: "about" },
          icon: "mdi-information-outline",
        },
      ]
    },
  },
}
</script>

<style>
.header_logo {
  border-right: 1px solid white;
}
</style>
