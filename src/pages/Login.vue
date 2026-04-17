<template>
  <v-row align="center" justify="center" class="fill-height">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="pt-6 px-6">{{ $t('Login') }}</v-card-title>
        <v-card-text class="px-6 pb-6">
          <!-- OIDC -->
          <v-btn
            v-if="oidcEnabled"
            block
            size="large"
            variant="outlined"
            :loading="loading"
            @click="signInWithOidc"
          >
            <v-icon start>mdi-openid</v-icon>
            {{ $t('Login with SSO') }}
          </v-btn>

          <!-- Divider between OIDC and password login -->
          <template v-if="oidcEnabled && passwordEnabled">
            <v-divider class="my-4">
              <span class="text-medium-emphasis text-body-2">or</span>
            </v-divider>
          </template>

          <!-- Username / password -->
          <v-form v-if="passwordEnabled" @submit.prevent="submit">
            <v-text-field
              v-model="identifier"
              :label="$t('Username')"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              autocomplete="username"
              class="mb-2"
              hide-details
            />
            <v-text-field
              v-model="password"
              :label="$t('Password')"
              type="password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              autocomplete="current-password"
              hide-details
            />
            <v-alert v-if="error" color="error" variant="tonal" class="mt-4">
              {{ error }}
            </v-alert>
            <div
              v-if="loginHint"
              class="text-center mt-4 text-body-2"
              v-html="loginHint"
            />
            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              class="mt-6"
              :loading="loading"
            >
              <v-icon start>mdi-login</v-icon>
              {{ $t('Login') }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { env } from '@/utils/env'
import { oidcEnabled } from '@/oidc'

const route = useRoute()
const router = useRouter()
const { login, loginWithOidc } = useAuth()

const identifier = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const loginHint = env.VITE_LOGIN_HINT

const passwordEnabled = !!env.VITE_LOGIN_URL

async function signInWithOidc() {
  loading.value = true
  try {
    const redirect = route.query.redirect as string | undefined
    if (redirect) {
      sessionStorage.setItem('post_login_redirect', redirect)
    }
    await loginWithOidc()
  } catch (err: any) {
    error.value = err.message ?? 'Failed to initiate SSO login'
    loading.value = false
  }
}

async function submit() {
  error.value = null
  loading.value = true
  try {
    await login(identifier.value, password.value)
    const redirect = route.query.redirect as string | undefined
    router.push(redirect || { name: 'submitted_applications' })
  } catch (err: any) {
    error.value = err.response?.data ?? err.message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
