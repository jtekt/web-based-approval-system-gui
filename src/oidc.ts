import { UserManager, type UserManagerSettings } from 'oidc-client-ts'
import { env } from './utils/env'

const authority = env.VITE_OIDC_AUTHORITY
const client_id = env.VITE_OIDC_CLIENT_ID
const audience = env.VITE_OIDC_AUDIENCE

function createUserManager(): UserManager | null {
  if (!authority || !client_id) return null

  const settings: UserManagerSettings = {
    authority,
    client_id,
    redirect_uri: `${window.location.origin}/oidc-callback`,
    response_type: 'code',
    scope: 'openid profile email',
  }

  if (audience) {
    settings.extraQueryParams = { audience }
  }

  return new UserManager(settings)
}

export const oidcEnabled = authority && client_id && window.isSecureContext

export const userManager = createUserManager()
