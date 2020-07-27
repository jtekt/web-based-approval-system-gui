
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'

// Global components
import Loader from '@moreillon/vue_loader'

// Global Icons
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import ArrowLeftIcon from 'vue-material-design-icons/ArrowLeft.vue'
import ArrowRightIcon from 'vue-material-design-icons/ArrowRight.vue'
import ContentDuplicateIcon from 'vue-material-design-icons/ContentDuplicate.vue'
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue'
import AccountMultiplePlusIcon from 'vue-material-design-icons/AccountMultiplePlus.vue'
import ClockOutlineIcon from 'vue-material-design-icons/ClockOutline.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import DotsHorizontalIcon from 'vue-material-design-icons/DotsHorizontal.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'
import SendIcon from 'vue-material-design-icons/Send.vue'

Vue.use(VueCookies)
Vue.use(VueAxios, axios)

Vue.component('Loader', Loader)

Vue.component('download-icon', DownloadIcon)
Vue.component('delete-icon', DeleteIcon)
Vue.component('check-icon', CheckIcon)
Vue.component('close-icon', CloseIcon)
Vue.component('arrow-left-icon', ArrowLeftIcon)
Vue.component('arrow-right-icon', ArrowRightIcon)
Vue.component('content-duplicate-icon', ContentDuplicateIcon)
Vue.component('magnify-icon', MagnifyIcon)
Vue.component('account-multiple-plus-icon', AccountMultiplePlusIcon)
Vue.component('clock-outline-icon', ClockOutlineIcon)
Vue.component('plus-icon', PlusIcon)
Vue.component('dots-horizontal-icon', DotsHorizontalIcon)
Vue.component('open-in-new-icon', OpenInNewIcon)
Vue.component('send', SendIcon)

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
