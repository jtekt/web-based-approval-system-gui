export default {
  computed: {
    current_user_id () {
      return this.$store.state.current_user.identity.low ||
        this.$store.state.current_user.identity
    }
  }
}
