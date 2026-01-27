import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        current_user: null,
        email_required: false,
        received_pending_application_count: 0,
        tokens: null,
    },
    mutations: {
        set_current_user(state, user) {
            state.current_user = user.profile || user
        },
        require_email(state, email_required) {
            state.email_required = email_required
        },
        check_pending_applications(state) {
            if (!state.current_user) return
            const params = {
                relationship: 'SUBMITTED_TO',
                state: 'pending',
            }
            Vue.axios
                .get(`/applications`, { params })
                .then(({ data }) => {
                    state.received_pending_application_count = data.count
                })
                .catch((error) => {
                    console.error(error)
                })
        },
        set_tokens(state, tokens) {
            state.tokens = tokens
        },
    },
    actions: {},
    modules: {},
})
