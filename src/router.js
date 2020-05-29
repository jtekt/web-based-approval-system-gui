import Vue from 'vue'
import Router from 'vue-router'
import CreateApplication from './views/CreateApplication.vue'
import ApplicationTemplateList from './views/ApplicationTemplateList.vue'
import ApplicationTemplate from './views/ApplicationTemplate.vue'
import ShowApplication from './views/ShowApplication.vue'
import SubmittedApplications from './views/SubmittedApplications.vue'
import ReceivedApplications from './views/ReceivedApplications.vue'
import Search from './views/Search.vue'
import About from './views/About.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/create_application',
      name: 'create_application',
      component: CreateApplication,
      props: true,
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
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
    {
      path: '/application_template',
      name: 'application_template',
      component: ApplicationTemplate,
    },
    {
      path: '/application_template_list',
      name: 'application_template_list',
      component: ApplicationTemplateList,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },

  ]
})
