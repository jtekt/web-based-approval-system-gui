<template>
  <div id="app">

    <TopBar appInfo="Application form manager v0.1"/>



    <div id="nav">
      <router-link to="/create_application">Create Application</router-link>
      <router-link to="/">Submitted Applications</router-link>
      <router-link to="/received_applications">Received Applications</router-link>
    </div>

    <router-view/>
  </div>
</template>

<script>
// @ is an alias to /src
import TopBar from '@/components/top_bar/TopBar.vue'

export default {
  components: {
    TopBar,
  },
}
</script>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}



/* NAVIGATION BAR */
#nav {
  background-color: #cccccc;

  display: flex;
}

#nav a {

  flex-grow: 1;
  flex-basis: 0;

  padding: 10px;
  text-align: center;

  text-decoration: none;

  font-weight: bold;
  color: #444444;
}

#nav a.router-link-exact-active {
  color: #c00000;
}


.application_container {

  border: 1px solid black;
  border-radius: 5px;

  margin: 15px;
  padding: 5px;

  display: flex;
  justify-content: space-between;

}

/* Application info table */
.application_info {
  width: 50%;
}

.application_info table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.application_info td, .application_info th {
  padding: 5px;
}

.application_info th {
  padding-top: 10px;
}


.application_info td {
  border-top: 1px solid #666666;
}

.inkans_area{

  width: 50%;

  /* display inkan containers next to one another */
  display: flex;
  justify-content: flex-end;
}

.inkan_box {
  margin-left: 5px;
  width: 100px;
  height: 150px;

  border: 1px solid black;
  border-radius: 5px;
}




.inkan_container {
  flex-grow: 1;
  padding: 2%;

  height: 80%;
  width: 100%;
}

.recipient_container{
  border-top: 1px solid black;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.inkan{
  height: 100%;
  width: 100%;

}

</style>