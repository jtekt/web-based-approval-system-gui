<template>
  <div class="">
    <h1>Search</h1>
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
export default {
  name: 'Search',
  data () {
    return {
      application_id: '',
      hanko_id: ''
    }
  },
  methods: {
    search_application () {
      this.$router.push({ name: 'show_application', query: { id: this.application_id } })
    },
    search_hanko () {
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/find_by_hanko`, {
        params: { approval_id: this.hanko_id }
      })
        .then(response => {
          if (confirm('Hanko valid. See application?')) {
            this.$router.push({ name: 'show_application',
              query: {
                id: response.data.id
              } })
          }
        })
        .catch(error => {
          if (error.response) {
            if (error.response.status === 404) alert('Hanko is invalid')
          } else alert('Error')
        })
    }

  }
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
