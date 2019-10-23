<template>

  <div class="inkan_box">

    <!-- Inkan goes inside here -->
    <div class="inkan_container">
      <slot></slot>
    </div>

    <!-- info about the recipient -->
    <div class="recipient_container">
      {{submission.recipient.properties.family_name_kanji}}
    </div>


  </div>
</template>

<script>
export default {
  name: 'InkanBox',
  props: {
    submission: Object,
  },


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>




</style>
