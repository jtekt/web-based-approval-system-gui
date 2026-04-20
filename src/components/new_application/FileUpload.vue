<template>
  <v-file-input
    v-if="!modelValue"
    :loading="loading"
    :accept="accept"
    @update:model-value="fileUpload"
    :label="label"
  />
  <v-text-field
    v-else
    :label="label"
    readonly
    prepend-icon="mdi-paperclip-check"
    :model-value="$t('Upload OK')"
    clearable
    @click:clear="$emit('update:modelValue', null)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  modelValue?: string | null
  accept?: string
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const { t } = useI18n()
const toast = useToast()

const loading = ref(false)

async function fileUpload(file: File | File[] | null) {
  if (!file || Array.isArray(file)) return
  loading.value = true
  const formData = new FormData()
  formData.append('file_to_upload', file)
  try {
    const { data } = await api.post<{ file_id: string }>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    emit('update:modelValue', data.file_id)
  } catch (error) {
    toast.error(t('Upload failed'))
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
