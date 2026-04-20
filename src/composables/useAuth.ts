import { ref, computed } from 'vue'
import api from '@/api'
import { User as OidcUser } from 'oidc-client-ts'
import { oidcManager } from '@/oidc'
import { env } from '@/utils/env'
import type { User } from '@/types'

/* =========================
 * Types
 * ========================= */

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

/* =========================
 * Core Logic
 * ========================= */

async function identify(): Promise<boolean> {
  const identificationUrl = env.VITE_IDENTIFICATION_URL

  // --- helper: apply auth header + tokens ---
  const applyAuth = (
    mode: 'oidc' | 'jwt',
    accessToken: string,
    idToken?: string
  ) => {
    authMode.value = mode

    tokens.value = {
      access_token: accessToken,
      ...(idToken ? { id_token: idToken } : {}),
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  // --- helper: fetch current user ---
  const fetchCurrentUser = async () => {
    const { data } = await api.get<User>(identificationUrl)

    currentUser.value = {
      _id: data._id,
      username: data.username,
      display_name: data.display_name ?? data.username ?? '',
    }
  }

  // ---- 1. Try OIDC ----
  try {
    const oidcUser = await getOidcUser()

    if (oidcUser && !oidcUser.expired) {
      applyAuth('oidc', oidcUser.access_token, oidcUser.id_token)

      await fetchCurrentUser()

      return true
    }
  } catch (err) {
    console.warn('OIDC session failed, falling back to JWT', err)
  }

  // ---- 2. Fallback to JWT ----
  const jwt = getStoredJwt()
  if (!jwt) return false

  applyAuth('jwt', jwt)

  try {
    await fetchCurrentUser()
    return true
  } catch (error: any) {
    const status = error?.response?.status

    if (status === 401 || status === 403) {
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
  if (!oidcManager) return
  authMode.value = 'oidc'
  await oidcManager.signinRedirect()
}

/* =========================
 * OIDC Callback Handler
 * ========================= */

async function handleOidcCallback(): Promise<void> {
  if (!oidcManager) return
  await oidcManager.signinRedirectCallback()
  await identify()
}

/* =========================
 * Logout
 * ========================= */

async function logout(): Promise<void> {
  if (authMode.value === 'oidc') {
    if (!oidcManager) return
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

  const isAuthenticated = computed(() => !!accessToken.value)

  const isOidc = computed(() => authMode.value === 'oidc')
  const isJwt = computed(() => authMode.value === 'jwt')

  // Backward compatibility
  function setCurrentUser(user: User | null) {
    currentUser.value = user
  }

  function setTokens(newTokens: Tokens | null) {
    tokens.value = newTokens
  }

  return {
    // state
    currentUser,
    tokens,
    accessToken,
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
