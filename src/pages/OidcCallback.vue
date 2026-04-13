<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="auto" class="text-center">
        <template v-if="error">
          <v-icon size="56" color="error">mdi-alert-circle-outline</v-icon>
          <div class="text-h6 mt-4">{{ $t('Sign in failed') }}</div>
          <div class="text-body-2 text-medium-emphasis mt-2">{{ error }}</div>
          <v-btn class="mt-6" :to="{ name: 'Login' }">
            {{ $t('Back to sign in') }}
          </v-btn>
        </template>
        <template v-else>
          <v-progress-circular indeterminate color="primary" size="48" />
          <div class="text-body-1 mt-4">{{ $t('Signing in…') }}</div>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleOidcCallback } from '@/composables/useOidc'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { identify } = useAuth()

const error = ref<string | null>(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const providerError = params.get('error')
  const providerErrorDescription = params.get('error_description')

  if (providerError) {
    error.value = providerErrorDescription ?? providerError
    return
  }

  if (!code || !state) {
    error.value = 'Missing authorization code or state'
    return
  }

  try {
    const { accessToken, redirectPath } = await handleOidcCallback(code, state)
    localStorage.setItem('jwt', accessToken)
    await identify()
    router.replace(
      redirectPath || { name: 'UserGroups', params: { user_id: 'self' } }
    )
  } catch (err: any) {
    error.value = err.message ?? 'An unexpected error occurred'
  }
})
</script>
