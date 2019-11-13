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






</style>
