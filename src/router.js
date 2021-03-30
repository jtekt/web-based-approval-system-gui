import Vue from 'vue'
import Router from 'vue-router'
import CreateApplication from './views/CreateApplication.vue'
import ApplicationTemplateList from './views/ApplicationTemplateList.vue'
import ApplicationTemplate from './views/ApplicationTemplate.vue'
// import ShowApplication from './views/ShowApplication.vue'
import ApplicationList from './views/ApplicationList.vue'

import Search from './views/Search.vue'
import About from './views/About.vue'
import Info from './views/Info.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // redirect everything else to inbox
    { path: '/', redirect: { name: 'submitted_applications' } },
    {
      path: '/applications/submitted',
      name: 'submitted_applications',
      component: ApplicationList,
      props: { type: 'submitted' }
    },
    {
      path: '/applications/received',
      name: 'received_applications',
      component: ApplicationList,
      props: { type: 'received' }
    },
    {
      path: '/applications/:application_id',
      name: 'application',
      // component: ShowApplication
      component: () => import('@/views/ShowApplication.vue')
    },
    {
      path: '/application_templates',
      name: 'application_templates',
      component: ApplicationTemplateList
    },
    {
      path: '/application_templates/:template_id',
      name: 'application_template',
      component: ApplicationTemplate
    },
    {
      path: '/create_application',
      name: 'create_application',
      component: CreateApplication
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    },
    {
      path: '/info',
      name: 'info',
      component: Info
    },

    // Legacy
    {
      path: '/application_list/:type',
      name: 'application_list',
      component: ApplicationList
    },
    {
      path: '/show_application',
      name: 'show_application',
      component: () => import('@/views/ShowApplication.vue')
    },
    {
      path: '/application_template_list',
      name: 'application_template_list',
      component: ApplicationTemplateList
    },

    {
      // will match everything
      path: '*', redirect: { name: 'submitted_applications' }
    }

  ]
})
