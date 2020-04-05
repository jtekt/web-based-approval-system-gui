import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'

Vue.use(VueCookies)
Vue.use(VueAxios, axios)


Vue.config.productionTip = false



// Redirect to authentication anager if not logged in

router.beforeEach((to, from, next) => {

  console.log(window.location.hostname)

  if(window.location.hostname.includes('maximemoreillon')) {
    window.location.href = process.env.VUE_APP_AUTHENTICATION_MANAGER_FRONT_URL;
  }

  var jwt = Vue.$cookies.get("jwt")
  if(jwt) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

    // get employee number
    axios.post(`${process.env.VUE_APP_AUTHENTICATION_MANAGER_URL}/decode_jwt`, { jwt: jwt })
    .then(response => {
      store.commit('set_employee_number', response.data.properties.employee_number)
      next();
    })
    .catch(error => {
      if(error.response) console.log(error.response.data)
      else console.log(error)
    })

  }
  else {
    delete axios.defaults.headers.common['Authorization']
    window.location.href = process.env.VUE_APP_AUTHENTICATION_MANAGER_URL;
  }

});



new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
