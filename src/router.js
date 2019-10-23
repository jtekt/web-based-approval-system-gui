import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import CreateApplication from './views/CreateApplication.vue'
import ShowApplication from './views/ShowApplication.vue'
import SubmittedApplications from './views/SubmittedApplications.vue'
import ReceivedApplications from './views/ReceivedApplications.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/create_application',
      name: 'create_application',
      component: CreateApplication
    },
    {
      path: '/',
      name: 'submitted_applications',
      component: SubmittedApplications
    },
    {
      path: '/received_applications',
      name: 'received_applications',
      component: ReceivedApplications
    },
    {
      path: '/show_application',
      name: 'show_application',
      component: ShowApplication,
    },

  ]
})
