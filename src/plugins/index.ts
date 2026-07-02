import type { App } from 'vue'
import vuetify from './vuetify'
import { i18n } from './i18n'
import router from '@/router'
import { createAuthPlugin } from '@jtekt/vuetify-auth'
import { createUI } from '@jtekt/vue-feedback-kit'

const auth = createAuthPlugin(
  {
    oidc: {
      clientId: import.meta.env.VITE_OIDC_CLIENT_ID!,
      authority: import.meta.env.VITE_OIDC_AUTHORITY!,
    },
    credentials: {
      loginEndpoint: import.meta.env.VITE_LEGACY_LOGIN_URL!,
      resetPasswordEndpoint: import.meta.env.VITE_LEGACY_PASSWORD_RESET_URL!,
    },
    enrichmentEndpoint: import.meta.env.VITE_LEGACY_IDENTIFICATION_URL!,
    enrichmentIdLookupField: '_id',
  },
  router
)

export function registerPlugins(app: App) {
  app.use(vuetify)
  app.use(i18n)
  app.use(auth)
  app.use(router)
  app.use(createUI)
}
