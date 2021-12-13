export default {
  methods: {
    get_id_of_item(item){
      return item._id
        || item.properties._id
        || item.identity.low
        || item.identity
    }
  },
  computed: {
    current_user_id () {
      const {current_user} = this.$store.state
      return this.get_id_of_item(current_user)
    }
  }
}
