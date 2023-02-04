<template>
  <div class="button_wrapper">
    <v-btn icon @click="$emit('send_email')">
      <div class="email_button_content">
        <v-icon v-if="submission && submission.notified"
          >mdi-email-check</v-icon
        >
        <v-icon v-else>mdi-email</v-icon>
        <div class="user_name">
          {{ user.family_name }}
        </div>
      </div>
    </v-btn>
  </div>
</template>

<script>
// TODO: have email sending functions here
export default {
  props: {
    user: Object,
    // application: Object,
  },
  computed: {
    submission() {
      // If submission exists, then user if recipient
      return this.user.submission
    },
  },
  methods: {
    // NOT USEABLE YET
    // email_button_clicked() {
    //   if (this.submission)
    //     this.send_email_to_recipient(this.user)
    //   else this.send_email_to_applicant()
    // },
    // send_email_to_recipient(recipient) {
    //   this.$store.commit("require_email", false)
    //   window.location.href = generate_email_to_recipient(
    //     this.application,
    //     recipient
    //   )
    //   this.mark_recipient_as_notified(recipient)
    // },
    // send_email_to_applicant() {
    //   this.$store.commit("require_email", false)
    //   window.location.href = generate_email_to_applicant(this.application)
    // },
    // async mark_recipient_as_notified(recipient) {
    //   try {
    //     const recipient_id = recipient._id
    //     const url = `/v2/applications/${this.application_id}/recipients/${recipient_id}/notifications`
    //     await this.axios.post(url)
    //     // Optimistic update, using $set for reactivity
    //     // WARNING: This updates both the application and the user
    //     this.$set(recipient.submission, "notified", true)
    //   } catch (error) {
    //     console.error(error)
    //   }
    // },
  },
}
</script>

<style scoped>
.email_button_content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user_name {
  max-width: 80px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
