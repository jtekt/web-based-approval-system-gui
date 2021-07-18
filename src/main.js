
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'

// Global components
import Loader from '@moreillon/vue_loader'



Vue.use(VueCookies)
Vue.use(VueAxios, axios)

Vue.component('Loader', Loader)

// Icons
Vue.component('download-icon', () => import('vue-material-design-icons/Download.vue'))
Vue.component('delete-icon', () => import('vue-material-design-icons/Delete.vue'))
Vue.component('check-icon', () => import('vue-material-design-icons/Check.vue'))
Vue.component('close-icon', () => import('vue-material-design-icons/Close.vue'))
Vue.component('arrow-left-icon', () => import('vue-material-design-icons/ArrowLeft.vue'))
Vue.component('arrow-right-icon', () => import('vue-material-design-icons/ArrowRight.vue'))
Vue.component('content-duplicate-icon', () => import('vue-material-design-icons/ContentDuplicate.vue'))
Vue.component('magnify-icon', () => import('vue-material-design-icons/Magnify.vue'))
Vue.component('account-multiple-plus-icon', () => import('vue-material-design-icons/AccountMultiplePlus.vue'))
Vue.component('clock-outline-icon', () => import('vue-material-design-icons/ClockOutline.vue'))
Vue.component('plus-icon', () => import('vue-material-design-icons/Plus.vue'))
Vue.component('dots-horizontal-icon', () => import('vue-material-design-icons/DotsHorizontal.vue'))
Vue.component('open-in-new-icon', () => import('vue-material-design-icons/OpenInNew.vue'))
Vue.component('send-icon', () => import('vue-material-design-icons/Send.vue'))
Vue.component('content-save-icon', () => import('vue-material-design-icons/ContentSave.vue'))
Vue.component('account-icon', () => import('vue-material-design-icons/Account.vue'))
Vue.component('email-icon', () => import('vue-material-design-icons/Email.vue'))
Vue.component('menu-icon', () => import('vue-material-design-icons/Menu.vue'))
Vue.component('pencil-icon', () => import('vue-material-design-icons/Pencil.vue'))

Vue.config.productionTip = false

// Enforce authentication
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
  } else {
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
