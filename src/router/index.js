import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: { name: 'submitted_applications'}
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/applications/submitted',
    name: 'submitted_applications',
    component: () => import('../views/ApplicationList.vue'),
    props: {direction: 'submitted'}
  },
  {
    path: '/applications/received',
    name: 'received_applications',
    component: () => import('../views/ApplicationList.vue'),
    props: {direction: 'received'}
  },
  {
    path: '/applications/new',
    alias: '/new_application',
    name: 'new_application',
    component: () => import('../views/NewApplication.vue')
  },
  {
    path: '/applications/:application_id',
    name: 'application',
    component: () => import('../views/Application.vue')
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('../views/TemplateList.vue')
  },
  {
    path: '/templates/new',
    name: 'new_template',
    component: () => import('../views/NewTemplate.vue')
  },
  {
    path: '/templates/:template_id',
    name: 'template',
    component: () => import('../views/Template.vue')
  },
  {
    path: '/*',
    name: 'not_found',
    component: () => import('../views/NotFound.vue')
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
