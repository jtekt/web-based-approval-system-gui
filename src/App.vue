<template>
  <AppTemplate
    :options="template_options"
    @user="user_changed($event)"
    @tokens="handle_tokens_event($event)"
  >
    <template v-slot:header>
      <v-btn v-if="help_page_url" icon :href="help_page_url" target="_blank">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
    </template>

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
          <v-badge
            inline
            v-if="item.count"
            :content="item.count"
            color="#c00000"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-badge>

          <template v-else>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </AppTemplate>
</template>

<script>
import AppTemplate from "@moreillon/vue_application_template_vuetify"
import LocaleSelector from "./components/LocaleSelector.vue"

const {
  NODE_ENV,
  VUE_APP_LOGIN_URL,
  VUE_APP_IDENTIFICATION_URL,
  VUE_APP_PASSWORD_RESET_URL,
  VUE_APP_EMPLOYEE_MANAGER_FRONT_URL,
  VUE_APP_HOMEPAGE_URL,
  VUE_APP_HELP_PAGE_URL,
  VUE_APP_LOGIN_HINT,
  VUE_APP_OIDC_AUTHORITY,
  VUE_APP_OIDC_CLIENT_ID,
  VUE_APP_OIDC_AUDIENCE,
} = process.env;

export default {
  name: "App",

  components: {
    AppTemplate,
    LocaleSelector,
  },

  data() {
    return {
      template_options: {
        title: "電子捺印システム",
        skip_greetings: NODE_ENV === "development",

        login_url: VUE_APP_LOGIN_URL,
        identification_url: VUE_APP_IDENTIFICATION_URL,
        password_reset_url: VUE_APP_PASSWORD_RESET_URL,

        profile_url: `${VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/employees/self`,

        homepage_url: VUE_APP_HOMEPAGE_URL,
        login_hint: VUE_APP_LOGIN_HINT,

        header_logo: require("@/assets/jtekt_logo_negative.jpg"),
        authentication_logo: require("@/assets/jtekt_logo.jpg"),
        colors: { app_bar: "#000" },
        author: "Maxime Moreillon - JTEKT Corporation",
        oidc: {
          authority: VUE_APP_OIDC_AUTHORITY,
          client_id: VUE_APP_OIDC_CLIENT_ID,
          extraQueryParams: {
            audience: VUE_APP_OIDC_AUDIENCE,
          },
        },
      },
      help_page_url: VUE_APP_HELP_PAGE_URL,
    }
  },
  methods: {
    user_changed(user) {
      this.$store.commit("set_current_user", user);
      this.$store.commit("check_pending_applications");
    },
    handle_tokens_event(tokens) {
      this.$store.commit("set_tokens", tokens);
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
