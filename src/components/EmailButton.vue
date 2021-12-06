<template>
  <div class="button_wrapper">
    <v-btn
      icon

      @click="$emit('send_email')">
      <div class="email_button_content">
        <div class="">
          <v-icon>mdi-email</v-icon>
        </div>
        <div class="user_name">
          {{user.properties.family_name}}
        </div>
      </div>

    </v-btn>
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
  max-width: 80px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

</style>
