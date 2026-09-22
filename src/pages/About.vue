<template>
  <v-card
    max-width="30rem"
    class="mx-auto"
    prepend-icon="mdi-information"
    :title="env.VITE_APP_TITLE"
  >
    <v-card-text>
      <v-list>
        <v-list-item :title="t('Version')" :subtitle="version" />
        <v-divider />
        <v-list-subheader>{{ t("Environment variables") }}</v-list-subheader>
        <v-list-item
          title="VITE_PDF_ONLY"
          :subtitle="env.VITE_PDF_ONLY ? 'true' : 'false'"
        />
        <v-list-item
          title="VITE_SHINSEI_MANAGER_URL"
          :subtitle="env.VITE_SHINSEI_MANAGER_URL"
        />
        <v-list-item
          title="VITE_EMPLOYEE_MANAGER_API_URL"
          :subtitle="env.VITE_EMPLOYEE_MANAGER_API_URL"
        />
        <v-list-item
          title="VITE_EMPLOYEE_MANAGER_FRONT_URL"
          :subtitle="env.VITE_EMPLOYEE_MANAGER_FRONT_URL"
        />
        <v-list-item
          title="VITE_GROUP_MANAGER_API_URL"
          :subtitle="env.VITE_GROUP_MANAGER_API_URL"
        />
        <v-list-item
          title="VITE_LEGACY_LOGIN_URL"
          :subtitle="env.VITE_LEGACY_LOGIN_URL"
        />
        <v-list-item
          title="VITE_LEGACY_IDENTIFICATION_URL"
          :subtitle="env.VITE_LEGACY_IDENTIFICATION_URL"
        />
        <v-list-item
          title="VITE_LEGACY_PASSWORD_RESET_URL"
          :subtitle="env.VITE_LEGACY_PASSWORD_RESET_URL"
        />
        <v-list-item title="VITE_OIDC_AUTHORITY" :subtitle="env.VITE_OIDC_AUTHORITY" />
        <v-list-item title="VITE_OIDC_CLIENT_ID" :subtitle="env.VITE_OIDC_CLIENT_ID" />
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { env } from '@/utils/env'

const { t } = useI18n()
const version = env.VITE_APP_VERSION || 'dev'
</script>
