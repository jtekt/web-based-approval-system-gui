<template>
  <v-card class="mx-auto py-3 mt-12" max-width="500px" width="90vw">
    <v-card-title>{{ $t('Password reset') }}</v-card-title>
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="submit">
        <v-row>
          <v-col>
            <v-text-field
              v-model="username"
              :label="$t('Username')"
              :rules="[
                                (v: string) =>
                                    !!v || $t('This field is required'),
                            ]"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="text-center">
            <v-btn type="submit" :loading="processing" color="primary">
              {{ $t('Send reset link') }}
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="text-center">
            <router-link :to="{ name: 'login' }">{{
              $t('Back to login')
            }}</router-link>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>

  <v-snackbar v-model="snackbar" :color="snackbarColor">
    {{ snackbarText }}
    <template #actions>
      <v-btn icon @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { env } from '@/utils/env'
import api from '@/api'

const username = ref('')
const processing = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('#C00000')
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null
)

async function submit() {
  const result = await formRef.value?.validate()
  if (!result?.valid) return

  processing.value = true
  try {
    await api.post(env.VITE_PASSWORD_RESET_URL, {
      username: username.value,
    })
    snackbarColor.value = 'success'
    snackbarText.value = 'Password reset link sent'
    snackbar.value = true
  } catch (err: unknown) {
    const error = err as { response?: { data: string } }
    snackbarColor.value = '#C00000'
    snackbarText.value = error.response?.data ?? 'Something went wrong'
    snackbar.value = true
  } finally {
    processing.value = false
  }
}
</script>
