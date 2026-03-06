export default {
  computed: {
    user_as_recipient() {
      const { current_user } = this.$store.state;
      return this.application.recipients.find((recipient) =>
        this.users_match(recipient, current_user),
      );
    },
    user_is_applicant() {
      const { current_user } = this.$store.state;
      return this.users_match(current_user, this.application.applicant);
    },
    current_recipient_is_current_user() {
      if (!this.current_recipient) return false;
      return this.users_match(
        this.current_recipient,
        this.$store.state.current_user,
      );
    },
  },
};
