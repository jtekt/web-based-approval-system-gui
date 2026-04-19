/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHINSEI_MANAGER_URL: string
  readonly VITE_LOGIN_HINT?: string
  readonly VITE_OIDC_AUTHORITY?: string
  readonly VITE_OIDC_CLIENT_ID?: string
  readonly VITE_OIDC_AUDIENCE?: string
  readonly VITE_EMPLOYEE_MANAGER_FRONT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
