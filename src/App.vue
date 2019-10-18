<template>
  <div id="app">

    <div id="nav">
      <router-link to="/create_application">Create Application</router-link> |
      <router-link to="/">Submitted Applications</router-link> |
      <router-link to="/received_applications">Received Applications</router-link> |
    </div>
    <router-view/>
  </div>
</template>

<style>

* {
  box-sizing: border-box;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* NAVIGATION */
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
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
