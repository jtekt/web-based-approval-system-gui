import { createAuthPlugin } from '@jtekt/vuetify-auth'
import router from '@/router'

export const auth = createAuthPlugin(
  {
    oidc: {
      clientId: import.meta.env.VITE_OIDC_CLIENT_ID!,
      authority: import.meta.env.VITE_OIDC_AUTHORITY!,
      enrichmentEndpoint: import.meta.env.VITE_LEGACY_IDENTIFICATION_URL,
      identifierLookupField: import.meta.env.VITE_ENRICHMENT_ID,
    },
    credentials: {
      loginEndpoint: import.meta.env.VITE_LEGACY_LOGIN_URL!,
      resetPasswordEndpoint: import.meta.env.VITE_LEGACY_PASSWORD_RESET_URL,
      identifierLookupField: import.meta.env.VITE_ENRICHMENT_ID,
    },
  },
  router
)
