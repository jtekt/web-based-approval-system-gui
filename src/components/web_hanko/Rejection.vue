<template>

  <div class="rejection" >
    <span class="mdi mdi-close-circle-outline"/>

  </div>


</template>

<script>
export default {
  name: 'Rejection',

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.rejection{
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rejection > span {
  font-size: 400%;
  color: #c00000;
}

</style>
