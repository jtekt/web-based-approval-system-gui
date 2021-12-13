<template>
  <div
    class="user_preview"
    @click="view_profile()">

    <img
      class="author_avatar"
      v-if="user.properties.avatar_src"
      :src="user.properties.avatar_src">
    <span class="author_name">
      {{ user.properties.display_name
        || user.properties.name_kanji
        || user.properties.name
        || user.properties.username}}
    </span>

  </div>
</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'
export default {
  name: 'UserPreview',
  props: {
    user: Object
  },
  mixins: [IdUtils],
  components: {

  },

  data () {
    return {

    }
  },

  methods: {
    view_profile () {
      window.open(this.user_profile_url, '_blank')
    }

  },
  computed: {

    user_profile_url () {
      if(!this.user) return undefined
      const user_id = this.get_id_of_item(this.user)
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/users/${user_id}`
    }
  }
}
</script>

<style scoped>
.user_preview {
  cursor: pointer;
  transition: 0.25s;
  display: inline-flex;
  align-items: center;
}

.user_preview:hover {
  color: #c00000;
}
.author_avatar {
  height: 1em;
  width: 1em;
  margin-right: 0.25em;
}

.author_name {
  text-decoration: underline;
}

</style>
