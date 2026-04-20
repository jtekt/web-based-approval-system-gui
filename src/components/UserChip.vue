<template>
  <v-chip :href="user_profile_url" target="_blank">
    <v-avatar start class="mr-2">
      <v-img :src="user.avatar_src" v-if="user.avatar_src" />
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    <span>{{ name }}</span>
  </v-chip>
</template>

<script>
const { VUE_APP_EMPLOYEE_MANAGER_FRONT_URL } = process.env

export default {
  name: "UserChip",
  props: {
    user: Object,
    link: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    name() {
      return this.user.display_name || this.user.name || this.user.username
    },
    user_profile_url() {
      if (!VUE_APP_EMPLOYEE_MANAGER_FRONT_URL) return
      return `${VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/users/${this.user._id}`
    },
  },
}
</script>
