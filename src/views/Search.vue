<template>
  <form class="" v-on:submit.prevent="search()">
    <input type="search" v-model="application_id">
    <input type="submit" value="Search">
  </form>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Search',
  components: {

  },
  data(){
    return {
      application_id: "",
    }
  },
  methods: {
    search(){
      this.$router.push({ name: 'show_application', query: { id: this.application_id } })
    }
  },
}
</script>

<style scoped>
form {
  text-align: center;
  padding: 25px;
}
</style>
