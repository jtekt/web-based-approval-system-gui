<template>
  <v-card>
    <template #prepend>
      <v-icon>mdi-information-outline</v-icon>
    </template>
    <!-- TODO: Improve this page -->
    <template #title>{{ $t('About') }}</template>
    <v-card-text>
      {{ $t('App description', { version }) }}
      <v-data-table hide-default-footer :headers="headers" :items="settings" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import packageJson from '../../package.json'
import { env } from '@/utils/env'

const { t } = useI18n()
const version = packageJson.version

const headers = computed(() => [
  { title: t('Setting'), key: 'name' },
  { title: t('Value'), key: 'value' },
])

const settings = computed(() => [
  {
    name: 'Shinsei manager API',
    value: env.VITE_SHINSEI_MANAGER_URL,
  },
  {
    name: 'Employee manager API',
    value: env.VITE_EMPLOYEE_MANAGER_API_URL,
  },
  {
    name: 'Employee manager GUI',
    value: env.VITE_EMPLOYEE_MANAGER_FRONT_URL,
  },
  {
    name: 'Group manager API',
    value: env.VITE_GROUP_MANAGER_API_URL,
  },
  {
    name: 'Login URL',
    value: env.VITE_LOGIN_URL,
  },
  {
    name: 'Identification URL',
    value: env.VITE_IDENTIFICATION_URL,
  },
  { name: 'OIDC Authority', value: env.VITE_OIDC_AUTHORITY },
  { name: 'OIDC Client ID', value: env.VITE_OIDC_CLIENT_ID },
])
</script>
