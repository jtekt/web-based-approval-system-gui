<template>
  <v-card
    max-width="40rem"
    class="mx-auto"
    prepend-icon="mdi-information"
    :title="env.VITE_APP_TITLE"
    :subtitle="version"
  >
    <v-card-text>
      <div class="text-subtitle-2 mb-2">{{ t("Environment variables") }}</div>
      <v-table density="compact">
        <tbody>
          <tr v-for="envVar in envVars" :key="envVar.key">
            <td>{{ envVar.key }}</td>
            <td>{{ envVar.value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { env } from '@/utils/env'

const { t } = useI18n()
const version = env.VITE_APP_VERSION || 'dev'

const envVars = [
  { key: 'VITE_PDF_ONLY', value: env.VITE_PDF_ONLY ? 'true' : 'false' },
  { key: 'VITE_SHINSEI_MANAGER_URL', value: env.VITE_SHINSEI_MANAGER_URL },
  { key: 'VITE_EMPLOYEE_MANAGER_API_URL', value: env.VITE_EMPLOYEE_MANAGER_API_URL },
  { key: 'VITE_EMPLOYEE_MANAGER_FRONT_URL', value: env.VITE_EMPLOYEE_MANAGER_FRONT_URL },
  { key: 'VITE_GROUP_MANAGER_API_URL', value: env.VITE_GROUP_MANAGER_API_URL },
  { key: 'VITE_LEGACY_LOGIN_URL', value: env.VITE_LEGACY_LOGIN_URL },
  { key: 'VITE_LEGACY_IDENTIFICATION_URL', value: env.VITE_LEGACY_IDENTIFICATION_URL },
  { key: 'VITE_LEGACY_PASSWORD_RESET_URL', value: env.VITE_LEGACY_PASSWORD_RESET_URL },
  { key: 'VITE_OIDC_AUTHORITY', value: env.VITE_OIDC_AUTHORITY },
  { key: 'VITE_OIDC_CLIENT_ID', value: env.VITE_OIDC_CLIENT_ID },
]
</script>
