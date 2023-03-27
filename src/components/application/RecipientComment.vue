<template>
  <v-list-item two-line>
    <template v-if="decision">
      <v-list-item-content>
        <v-list-item-subtitle>{{
          recipient.display_name
        }}</v-list-item-subtitle>
        <v-list-item-title>
          <v-textarea
            ref="commentTextArea"
            v-if="editing"
            outlined
            auto-grow
            dense
            :rows="1"
            v-model="new_comment"
          />
          <v-textarea
            v-else
            solo
            flat
            readonly
            auto-grow
            dense
            :rows="1"
            :value="recipient_comment"
          />
        </v-list-item-title>
      </v-list-item-content>

      <v-list-item-icon v-if="recipient_is_user">
        <template v-if="editing">
          <v-btn @click="disable_editing()" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn :loading="loading" @click="update_comment()" icon>
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
        </template>

        <v-btn v-if="!editing" @click="enable_editing()" icon>
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-list-item-icon>
    </template>
  </v-list-item>
</template>

<script>
import IdUtils from "@/mixins/IdUtils.js"

export default {
  name: "ApprovalComment",
  props: {
    recipient: Object,
  },
  mixins: [IdUtils],
  data() {
    return {
      editing: false,
      loading: false,
      new_comment: "",
    }
  },
  methods: {
    enable_editing() {
      if (!this.recipient_is_user) return
      this.new_comment = this.recipient_comment || ""
      this.editing = true
      setTimeout(() => {
        this.$refs.commentTextArea.focus()
      }, 10)
    },
    disable_editing() {
      this.editing = false
    },
    update_comment() {
      if (!this.recipient_is_user) return
      this.loading = true
      const url = `/applications/${this.application_id}/comment`
      const body = { comment: this.new_comment || "No comment" }
      this.axios
        .put(url, body)
        .then(() => {
          this.disable_editing()
          this.$emit("comment_updated")
        })
        .catch((error) => {
          alert("Edit failed")
          if (error.response) console.error(error.response.data)
          else console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  computed: {
    application_id() {
      return this.$route.params.application_id
    },
    recipient_is_user() {
      return this.get_id_of_item(this.recipient) === this.current_user_id
    },
    decision() {
      return this.recipient.approval || this.recipient.refusal
    },

    recipient_comment() {
      if (!this.decision) return null
      return this.decision.comment || this.$t("No comment")
    },
  },
}
</script>

<style scoped></style>
