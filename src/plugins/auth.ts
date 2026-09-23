import { createAuthPlugin } from '@jtekt/vuetify-auth'
import router from '@/router'
import { env } from '@/utils/env'

export const auth = createAuthPlugin(
  {
    oidc: {
      clientId: env.VITE_OIDC_CLIENT_ID!,
      authority: env.VITE_OIDC_AUTHORITY!,
      enrichmentEndpoint: env.VITE_LEGACY_IDENTIFICATION_URL,
      identifierLookupField: env.VITE_AUTH_ENRICHMENT_ID_FIELD,
    },
    credentials: {
      loginEndpoint: env.VITE_LEGACY_LOGIN_URL!,
      resetPasswordEndpoint: env.VITE_LEGACY_PASSWORD_RESET_URL,
      identifierLookupField: env.VITE_AUTH_ENRICHMENT_ID_FIELD,
    },
  },
  router
)
