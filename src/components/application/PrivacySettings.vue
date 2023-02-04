<!-- NOT USED YET -->
<template></template>

<script>
import IdUtils from "@/mixins/IdUtils.js"

export default {
  name: "ApplicationPrivacy",
  props: {
    value: Object,
  },
  mixins: [IdUtils],

  data() {
    return {
      application: this.value,
    }
  },
  watch: {
    application: {
      deep: true,
      handler() {
        this.$emit("update", this.application)
      },
    },
  },
  computed: {
    application_id() {
      return this.application._id
    },
  },
  methods: {
    update_privacy_of_application() {
      const url = `/v2/applications/${this.application_id}/privacy`
      const body = { private: this.application.private }
      this.axios
        .put(url, body)
        .then(() => {})
        .catch(() => alert("Error updating privacy of application"))
    },
    share_with_group(group) {
      const url = `/v2/applications/${this.application_id}/privacy/groups`
      const body = { group_id: this.get_id_of_item(group) }
      this.axios
        .post(url, body)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          alert("Error updating visibility of application")
          console.error(error)
        })
    },
    remove_application_visibility_to_group(group) {
      const url = `/v2/applications/${
        this.application_id
      }/privacy/groups/${this.get_id_of_item(group)}`
      this.axios
        .delete(url)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          console.error(error)
          alert("Error updating visibility of application")
        })
    },
  },
}
</script>
