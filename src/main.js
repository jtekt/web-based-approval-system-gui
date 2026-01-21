import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueAxios from 'vue-axios'
import i18n from './i18n'
import OidcAuth from '@moreillon/oidc-auth'

const {
    VUE_APP_SHINSEI_MANAGER_URL,
    VUE_APP_OIDC_AUTHORITY,
    VUE_APP_OIDC_CLIENT_ID,
} = process.env

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

if (VUE_APP_OIDC_AUTHORITY && VUE_APP_OIDC_CLIENT_ID) {
    const auth = new OidcAuth({
        authority: VUE_APP_OIDC_AUTHORITY,
        client_id: VUE_APP_OIDC_CLIENT_ID,
    })
    auth.init().then((user) => {
        if (!user) return

        vueApp.$mount('#app')
        axios.defaults.headers.common[
            'Authorization'
        ] = `Bearer ${user.id_token}`
    })
    if (auth.userManager?.events) {
        auth.userManager.events.addUserLoaded((user) => {
            axios.defaults.headers.common[
                'Authorization'
            ] = `Bearer ${user.id_token}`
        })
    }
} else {
    vueApp.$mount('#app')
}
