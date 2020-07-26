
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'

//import '@mdi/font/css/materialdesignicons.css'


Vue.use(VueCookies)
Vue.use(VueAxios, axios)

Vue.config.productionTip = false

// Redirect to authentication manager if not logged in

router.beforeEach((to, from, next) => {
  var jwt = Vue.$cookies.get('jwt') // IS THIS OK?
  if (jwt) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

    // get employee number
    axios.get(`${process.env.VUE_APP_AUTHENTICATION_MANAGER_URL}/whoami`)
      .then(response => {
        store.commit('set_employee_number', response.data.properties.employee_number) // should be removed in the future
        store.commit('set_current_user', response.data)
        next()
      })
      .catch(error => {
        alert('Cannot authenticate user')
        if (error.response) console.log(error.response.data)
        else console.log(error)
      })
  }
  else {
    // Unset the authorization header
    delete axios.defaults.headers.common['Authorization']

    // Redirect to autheirzation ms front end
    // Not needed anymore since now using integrated login form
    // window.location.href = process.env.VUE_APP_AUTHENTICATION_MANAGER_FRONT_URL
  }
})


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
