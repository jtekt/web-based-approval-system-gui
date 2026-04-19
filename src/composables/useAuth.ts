import { ref, computed } from 'vue'
import api from '@/api'
import {
  User as OidcUser,
} from 'oidc-client-ts'
import { oidcManager } from '@/oidc'

/* =========================
 * Types
 * ========================= */

interface User {
  _id?: string
  username?: string
  preferred_username?: string
  display_name?: string
  isAdmin?: boolean
  profile?: Omit<User, 'profile'>
  properties?: { _id?: string }
  avatar_src?: string
}

interface Tokens {
  access_token?: string
  id_token?: string
  [key: string]: unknown
}

type AuthMode = 'jwt' | 'oidc' | null

/* =========================
 * Shared State
 * ========================= */

const currentUser = ref<User | null>(null)
const tokens = ref<Tokens | null>(null)
const authMode = ref<AuthMode>(null)

/* =========================
 * JWT Helpers
 * ========================= */

function getStoredJwt(): string | null {
  const local = localStorage.getItem('jwt')
  if (local) return local

  const match = document.cookie.match(/(?:^|;\s*)jwt=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

function clearStoredJwt() {
  localStorage.removeItem('jwt')
  document.cookie = 'jwt=; Max-Age=0; path=/'
}

/* =========================
 * OIDC Helpers
 * ========================= */

async function getOidcUser(): Promise<OidcUser | null> {
  if (!oidcManager) return null
  try {
    return await oidcManager.getUser()
  } catch {
    return null
  }
}

function mapOidcProfile(user: OidcUser): User {
  return {
    preferred_username: user.profile?.preferred_username,
    display_name: user.profile?.name,
    username: user.profile?.email,
  }
}

/* =========================
 * Core Logic
 * ========================= */

async function identify(): Promise<boolean> {
  // ---- 1. Try OIDC session ----
  const oidcUser = await getOidcUser()

  if (oidcUser && !oidcUser.expired) {
    authMode.value = 'oidc'

    tokens.value = {
      access_token: oidcUser.access_token,
      id_token: oidcUser.id_token,
    }

    api.defaults.headers.common['Authorization'] =
      `Bearer ${oidcUser.access_token}`

    currentUser.value = mapOidcProfile(oidcUser)

    return true
  }

  // ---- 2. Fallback to JWT ----
  const jwt = getStoredJwt()
  if (!jwt) return false

  authMode.value = 'jwt'

  tokens.value = { access_token: jwt }
  api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

  const identificationUrl = import.meta.env.VITE_IDENTIFICATION_URL
  if (!identificationUrl) return true

  try {
    const { data } = await api.get(identificationUrl)
    currentUser.value = data?.profile ?? data
    return true
  } catch (error: any) {
    if ([401, 403].includes(error.response?.status)) {
      await logout()
    }
    return false
  }
}

/* =========================
 * Login Methods
 * ========================= */

async function login(identifier: string, password: string): Promise<void> {
  authMode.value = 'jwt'

  const { data } = await api.post(import.meta.env.VITE_LOGIN_URL, {
    identifier,
    password,
  })

  if (!data.jwt) throw new Error('No JWT in response')

  localStorage.setItem('jwt', data.jwt)

  await identify()
}

async function loginWithOidc(): Promise<void> {
  if(!oidcManager) return
  authMode.value = 'oidc'
  await oidcManager.signinRedirect()
}

/* =========================
 * OIDC Callback Handler
* ========================= */

async function handleOidcCallback(): Promise<void> {
  if(!oidcManager) return
  await oidcManager.signinRedirectCallback()
  await identify()
}

/* =========================
* Logout
* ========================= */

async function logout(): Promise<void> {
  if (authMode.value === 'oidc') {
    if(!oidcManager) return
    try {
      await oidcManager.signoutRedirect()
    } catch {
      // fallback silently
    }
  }

  clearStoredJwt()

  delete api.defaults.headers.common['Authorization']

  currentUser.value = null
  tokens.value = null
  authMode.value = null
}

/* =========================
 * Silent Renew Handling
 * ========================= */

oidcManager?.events.addAccessTokenExpired(() => {
  oidcManager?.signinSilent().catch(() => {
    logout()
  })
})

/* =========================
 * Public API
 * ========================= */

export function useAuth() {
  const accessToken = computed(() => tokens.value?.access_token)

  const currentUserId = computed(() => {
    const user = currentUser.value
    if (!user) return undefined

    return user._id || user.preferred_username || user.properties?._id
  })

  const isAuthenticated = computed(() => !!accessToken.value)

  const isOidc = computed(() => authMode.value === 'oidc')
  const isJwt = computed(() => authMode.value === 'jwt')

  // Backward compatibility
  function setCurrentUser(user: User | null) {
    currentUser.value = user?.profile ?? user
  }

  function setTokens(newTokens: Tokens | null) {
    tokens.value = newTokens
  }

  return {
    // state
    currentUser,
    tokens,
    accessToken,
    currentUserId,
    isAuthenticated,
    isOidc,
    isJwt,

    // actions
    identify,
    login,
    loginWithOidc,
    handleOidcCallback,
    logout,

    // legacy support
    setCurrentUser,
    setTokens,
  }
}
