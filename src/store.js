import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    employee_number: "",
  },
  mutations: {
    set_employee_number(state, employee_number){
      state.employee_number = employee_number;
    }
  },
  actions: {

  }
})
