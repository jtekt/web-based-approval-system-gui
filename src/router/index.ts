import { createRouter, createWebHistory } from 'vue-router'
import { env } from '@/utils/env'
import { useAuth } from '@/composables/useAuth'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/oidc-callback',
      name: 'oidc_callback',
      component: () => import('@/pages/OidcCallback.vue'),
      meta: { public: true },
    },
    {
      path: '/password-reset',
      name: 'password_reset',
      component: () => import('@/pages/PasswordReset.vue'),
      meta: { public: true },
    },

    {
      path: '/',
      redirect: { name: 'submitted_applications' },
    },
    {
      path: '/applications/submitted',
      name: 'submitted_applications',
      component: () => import('@/pages/Applications.vue'),
      props: { direction: 'submitted' },
    },
    {
      path: '/applications/received',
      name: 'received_applications',
      component: () => import('@/pages/Applications.vue'),
      props: { direction: 'received' },
    },
    {
      path: '/applications/new',
      name: 'new_application',
      component: () => import('@/pages/NewApplication.vue'),
    },
    {
      path: '/applications/:application_id',
      name: 'application',
      component: () => import('@/pages/Application.vue'),
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('@/pages/TemplateList.vue'),
    },
    {
      path: '/templates/new',
      name: 'new_template',
      component: () => import('@/pages/NewTemplate.vue'),
    },
    {
      path: '/templates/:template_id',
      name: 'template',
      component: () => import('@/pages/Template.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/Search.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/About.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not_found',
      component: () => import('@/pages/NotFound.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const { tokens, identify } = useAuth()

  if (to.meta.public) {
    // Redirect away from login if already authenticated
    if (to.name === 'Login' && tokens.value) {
      return { name: 'UserGroups', params: { user_id: 'self' } }
    }
    return true
  }

  if (tokens.value) return true

  const success = await identify()
  if (success) return true

  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
