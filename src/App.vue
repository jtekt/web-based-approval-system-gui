<template>
  <div id="app">
    <Header applicationName="申請マネージャー"/>

    <div class="columns_container">
      <Nav>
        <router-link to="create_application">
          <span class="mdi mdi-file-document-box-plus-outline"/>
          <span>New</span>
        </router-link>
        <router-link to="/">
          <span class="mdi mdi-file-document-box-multiple-outline"/>
          <span>Applications</span>
        </router-link>
        <router-link to="/received_applications">
          <span class="mdi mdi-inbox-arrow-down"/>
          <span>Inbox</span>
        </router-link>
      </Nav>

      <div class="right_column">
        <router-view class="main"/>
        <Footer applicationName="申請マネージャー v0.3"/>
      </div>

    </div>
  </div>
</template>

<script>
import Header from '@/components/jtekt_vue_layouting_components/Header.vue'
import Footer from '@/components/jtekt_vue_layouting_components/Footer.vue'
import Nav from '@/components/jtekt_vue_layouting_components/Nav.vue'

export default {
  components: {
    Header,
    Footer,
    Nav,
  },
}
</script>

<style>

@import './components/jtekt_vue_layouting_components/master.css';

.main {
  padding: 25px;
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
  border-top: 1px solid #dddddd;
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



/* CAN BE DELETED ONCE USING THE WEBHANKO COMPONENT */
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
