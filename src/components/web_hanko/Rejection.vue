<template>
  <div class="rejection" >
    <close-circle-outline-icon/>
  </div>
</template>

<script>

import CloseCircleOutlineIcon from 'vue-material-design-icons/CloseCircleOutline.vue'

export default {
  name: 'Rejection',
  components: {
    CloseCircleOutlineIcon
  }

}
</script>

<style scoped>
.rejection{
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c00000;
  font-size: 400%;
}

</style>
