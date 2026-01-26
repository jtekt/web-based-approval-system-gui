import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAxios from 'vue-axios'
import i18n from './i18n'

const { VUE_APP_SHINSEI_MANAGER_URL } = process.env

axios.defaults.baseURL = VUE_APP_SHINSEI_MANAGER_URL

Vue.use(VueAxios, axios)
Vue.config.productionTip = false

const vueApp = new Vue({
    router,
    store,
    vuetify,
    i18n,
    render: (h) => h(App),
})

router.afterEach(() => {
    store.commit('check_pending_applications')
})
vueApp.$mount('#app')
