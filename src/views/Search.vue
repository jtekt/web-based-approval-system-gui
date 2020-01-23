<template>
  <div class="">
    <form class="" v-on:submit.prevent="search_application()">
      <label for="">申請検索</label>
      <input type="search" v-model="application_id" placeholder="ID">
      <input type="submit">

    </form>
    <form class="" v-on:submit.prevent="search_hanko()">
      <label for="">ハンコ検索</label>
      <input type="search" v-model="hanko_id" placeholder="ID">
      <input type="submit">
    </form>
  </div>

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
      hanko_id: "",
    }
  },
  methods: {
    search_application(){
      this.$router.push({ name: 'show_application', query: { id: this.application_id } })
    },
    search_hanko(){
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/find_application_by_hanko', {
        approval_id: this.hanko_id,
      })
      .then(response => {
        if(response.data.length > 0){
          this.$router.push({ name: 'show_application', query: {
            id: response.data[0]._fields[0].identity.low
          }})
        }
        else alert('Not found')
      })
      .catch(error => console.log(error));
    }

  },
}
</script>

<style scoped>
form {
  text-align: center;
  padding: 25px;
}
form > * {
  margin: 5px;
}
</style>
