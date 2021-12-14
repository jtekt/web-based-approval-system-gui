// Using these functions because ID have changed multiple times over the course of time
export default {
  methods: {
    get_id_of_item(item){

      let id = item._id
        || item.properties._id

      if(!id) {
        console.warn(`Item does not have an _id:`)
        console.warn(item)
        id = item.identity.low
          || item.identity
      }

      return id
    }
  },
  computed: {
    current_user_id () {
      const {current_user} = this.$store.state
      if(!current_user) return undefined
      return this.get_id_of_item(current_user)
    }
  }
}
