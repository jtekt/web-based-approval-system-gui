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


// Redirect to login screen if not logged in
router.beforeEach((to, from, next) => {
  axios.post('http://172.16.98.151:8091/status')
  .then(response => {
    if(response.data.logged_in){
      store.commit('set_employee_number', response.data.employee_number)
      next();
    }
    else window.location.href = "http://172.16.98.151/login_manager/";
  })
  .catch(error => console.log(error))
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
