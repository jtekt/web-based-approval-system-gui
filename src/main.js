import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'


axios.defaults.withCredentials = true
axios.defaults.crossDomain = true

Vue.use(VueAxios, axios)
Vue.config.productionTip = false



// Redirect to authentication anager if not logged in
router.beforeEach((to, from, next) => {
  axios.post('http://authentication.mike.jtekt.maximemoreillon.com/status')
  .then(response => {
    if(response.data.logged_in){
      store.commit('set_employee_number', response.data.employee_number)
      next();
    }
    else window.location.href = "http://authentication.mike.jtekt.maximemoreillon.com/";
  })
  .catch(error => console.log(error))
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
