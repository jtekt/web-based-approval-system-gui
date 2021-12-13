<template>
  <div class="button_wrapper">
    <button
      icon

      @click="$emit('send_email')">
      <div class="email_button_content">
        <div class="">
          <email-icon />
        </div>
        <div class="user_name">
          {{user.properties.family_name}}
        </div>
      </div>

    </button>
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    user: Object
  },
  data () {
    return {
    }
  },
  methods: {

  },
  computed: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.email_button_content{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user_name {
  width: 40px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 75%;
}

</style>
