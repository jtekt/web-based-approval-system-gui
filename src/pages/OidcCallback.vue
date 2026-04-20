<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="auto" class="text-center">
        <template v-if="error">
          <v-icon size="56" color="error">mdi-alert-circle-outline</v-icon>
          <div class="text-h6 mt-4">{{ $t('Sign in failed') }}</div>
          <div class="text-body-2 text-medium-emphasis mt-2">{{ error }}</div>
          <v-btn class="mt-6" :to="{ name: 'login' }">
            {{ $t('Back to sign in') }}
          </v-btn>
        </template>

        <template v-else>
          <v-progress-circular indeterminate color="primary" size="48" />
          <div class="text-body-1 mt-4">{{ $t('Signing in') }}</div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { handleOidcCallback } = useAuth()

const error = ref<string | null>(null)

onMounted(async () => {
  try {
    await handleOidcCallback()

    // Optional: restore redirect path if you stored one before login
    const redirectPath = sessionStorage.getItem('post_login_redirect')
    sessionStorage.removeItem('post_login_redirect')

    await router.replace(
      redirectPath ? redirectPath : { name: 'submitted_applications' }
    )
  } catch (err: any) {
    console.error('OIDC callback error:', err)
    error.value =
      err?.message || err?.error_description || 'Authentication failed'
  }
})
</script>
