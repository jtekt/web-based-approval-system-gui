<template>
  <v-card>
    <v-card-title class="text-h4">申請マネージャ</v-card-title>
    <v-card-subtitle>v{{ version }}</v-card-subtitle>
    <v-card-text>
      A GUI for 申請マネージャー developed and maintained by Maxime MOREILLON.
    </v-card-text>
    <v-card-text>
      <v-data-table hide-default-footer :headers="headers" :items="settings" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import packageJson from '../../package.json'
import { env } from '@/utils/env'

const version = packageJson.version

const headers = [
  { title: 'Setting', key: 'name' },
  { title: 'Value', key: 'value' },
]

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
