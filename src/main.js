import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAxios from 'vue-axios'
import i18n from './i18n'

Vue.use(VueAxios, axios)
Vue.config.productionTip = false

router.afterEach( () => {
  if(!store.state.curren_user) return
  const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications`
  const params = {
    relationship: 'SUBMITTED_TO',
     state: 'pending',
   }
  Vue.axios.get(url, {params})
  .then( ({data}) => { store.commit('set_received_pending_application_count', data.count) })
  .catch(error => {console.error(error)})
})

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
