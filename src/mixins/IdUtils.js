// Using these functions because ID have changed multiple times over the course of time
export default {
  methods: {
    get_id_of_item(item) {
      let id = item._id || item.properties._id

      if (!id) {
        console.warn(`Item does not have an _id:`)
        console.warn(item)
        id = item.identity.low || item.identity
      }

      return id
    },
    get_user_identifiers(user) {
      if (!user) return []

      return [
        user._id,
        user.properties?._id,
        user.username,
        user.preferred_username,
        user.identity?.low,
        user.identity,
      ].filter(Boolean)
    },

    users_match(a, b) {
      const aIds = this.get_user_identifiers(a)
      const bIds = new Set(this.get_user_identifiers(b))

      return aIds.some((id) => bIds.has(id))
    },
  },
  computed: {
    user_picker_token() {
      const { tokens } = this.$store.state
      if (tokens?.access_token) return tokens.access_token

      let jwt = this.$cookies.get('jwt')
      if (jwt) return jwt
      return undefined
    },
  },
}
