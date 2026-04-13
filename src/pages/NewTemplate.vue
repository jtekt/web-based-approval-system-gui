<template>
  <v-card max-width="500" class="mx-auto">
    <v-toolbar flat>
      <v-btn exact icon :to="{ name: 'templates' }">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('New template') }}</v-toolbar-title>
    </v-toolbar>
    <v-divider />
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="createTemplate">
        <v-row align="center">
          <v-col>
            <v-text-field
              v-model="label"
              :label="$t('Name')"
              :rules="nameRules"
              required
            />
          </v-col>
          <v-col cols="auto">
            <v-btn type="submit">
              <v-icon start>mdi-plus</v-icon>
              <span>{{ $t('Create') }}</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useIdUtils } from '@/composables/useIdUtils'
import api from '@/api'

const router = useRouter()
const { getIdOfItem } = useIdUtils()

const label = ref('')
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null
)

const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length <= 100 || 'Name must be less than 100 characters',
]

async function createTemplate() {
  const result = await formRef.value?.validate()
  if (!result?.valid) return

  try {
    const { data } = await api.post<{ _id?: string }>('/templates', {
      label: label.value,
    })
    const templateId = getIdOfItem(data)
    router.push({ name: 'template', params: { template_id: templateId } })
  } catch (err) {
    console.error(err)
  }
}
</script>
