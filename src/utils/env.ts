import { z } from 'zod'

const envSchema = z.object({
  VITE_PDF_ONLY: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.stringbool().optional()
  ),

  VITE_SHINSEI_MANAGER_URL: z.url().default('http://localhost:8000'),

  VITE_EMPLOYEE_MANAGER_API_URL: z.url(),
  VITE_GROUP_MANAGER_API_URL: z.url(),
  VITE_EMPLOYEE_MANAGER_FRONT_URL: z.url(),

  VITE_HOMEPAGE_URL: z.url().optional(),

  VITE_LOGIN_URL: z.url(),
  VITE_IDENTIFICATION_URL: z.url(),
  VITE_PASSWORD_RESET_URL: z.url(),

  VITE_LOGIN_HINT: z.string().optional(),

  VITE_OIDC_AUTHORITY: z.string().optional(),
  VITE_OIDC_CLIENT_ID: z.string().optional(),
  VITE_OIDC_AUDIENCE: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
