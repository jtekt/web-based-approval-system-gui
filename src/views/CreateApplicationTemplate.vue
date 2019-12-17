<template>
  <form v-on:submit.prevent="submit()">

  </form>
</template>

<script>



export default {
  name: 'EditApplicationTemplate',
  components: {},
  mixins: [],
  data(){
    return {

    }
  },
  mounted(){


  },
  methods: {
    submit(){
      console.log("submit")
    }

  },
  computed: {

  }
}
</script>

<style scoped>


</style>
