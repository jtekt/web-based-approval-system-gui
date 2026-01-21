export default {
    computed: {
        current_user_is_admin() {
            const { current_user } = this.$store.state
            if (!current_user) return false

            return Boolean(
                current_user.isAdmin ||
                    current_user.administrator ||
                    current_user.properties?.isAdmin ||
                    current_user.properties?.administrator
            )
        },
    },
}
