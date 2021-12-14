import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    current_user: null,
    email_required: false,
    received_pending_application_count: 0,
  },
  mutations: {
    set_current_user(state, user){
      state.current_user = user
    },
    require_email(state, email_required){
      state.email_required = email_required
    },
    set_received_pending_application_count(state, count){
      state.received_pending_application_count = count
    }
  },
  actions: {
  },
  modules: {
  }
})
