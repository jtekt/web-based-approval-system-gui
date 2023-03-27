<!-- Used in Application.vue -->
<template>
  <v-dialog v-model="dialog" max-width="60rem" class="mx-auto">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="black" dark v-bind="attrs" v-on="on">
        <v-icon left>mdi-account-plus</v-icon>
        <span>{{ $t("Add") }}</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title> Add a manager </v-card-title>

      <v-card-text>
        <UserPicker @selection="userSelected($event)" />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UserPicker from "@moreillon/vue_user_picker"

export default {
  name: "AddGroupDialog",
  components: {
    UserPicker,
  },
  data() {
    return {
      dialog: false,
      loading: false,
    }
  },

  methods: {
    async userSelected(user) {
      if (!confirm(`Make user ${user.display_name} manager of this template?`))
        return
      this.loading = true
      try {
        const template_id = this.$route.params.template_id
        const url = `/templates/${template_id}/managers`
        const body = { user_id: user._id }
        await this.axios.post(url, body)
        this.$emit("selection", user)
        this.dialog = false
      } catch (error) {
        alert(`Failed`)
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
