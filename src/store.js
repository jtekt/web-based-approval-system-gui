import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    employee_number: '',
    current_user: null
  },
  mutations: {
    set_employee_number (state, employee_number) {
      state.employee_number = employee_number
    },
    set_current_user (state, current_user) {
      state.current_user = current_user
    }
  },
  actions: {

  }
})
