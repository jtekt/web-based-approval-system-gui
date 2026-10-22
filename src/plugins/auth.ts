import { createAuthPlugin } from '@jtekt/vuetify-auth'
import router from '@/router'
import { env } from '@/utils/env'
import api from '@/api'

export const auth = createAuthPlugin(
  {
    strategies: {
      oidc: {
        clientId: env.VITE_OIDC_CLIENT_ID!,
        authority: env.VITE_OIDC_AUTHORITY!,
        enrichment: {
          endpoint: env.VITE_LEGACY_IDENTIFICATION_URL!,
        },
        identity: {
          source: 'enrichment',
          identifierLookupField: env.VITE_AUTH_ENRICHMENT_ID_FIELD || '_id',
        },
      },
      credentials: {
        loginEndpoint: env.VITE_LEGACY_LOGIN_URL!,
        identity: {
          identifierLookupField: env.VITE_AUTH_ENRICHMENT_ID_FIELD || '_id',
        },
      },
    },
    onAuthError: (error) => console.error('[Auth]', error),
    onSessionChange(session) {
      if (!session) {
        console.log('[SESSION] no session')
        delete api.defaults.headers.common['Authorization']
        return
      }

      const token = session.accessToken

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete api.defaults.headers.common['Authorization']
      }
    },
  },
  router
)
