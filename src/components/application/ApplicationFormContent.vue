<template>
  <div>
    <div class="text-h6">{{ $t('Application info') }}</div>

    <v-list density="compact">
      <v-divider />
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>ID</span>
          <span class="text-caption">{{ application._id }}</span>
        </div>
      </v-list-item>
      <v-divider />
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>{{ $t('Title') }}</span>
          <span>{{ application.title }}</span>
        </div>
      </v-list-item>
      <v-divider />
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>{{ $t('Type') }}</span>
          <span>{{ application.type }}</span>
        </div>
      </v-list-item>
      <v-divider />
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>{{ $t('Date') }}</span>
          <span>{{
            application.creation_date
              ? formatDateNeo4j(application.creation_date)
              : ''
          }}</span>
        </div>
      </v-list-item>
      <v-divider />
      <v-list-item>
        <div class="d-flex justify-space-between align-center">
          <span>{{ $t('Applicant') }}</span>
          <UserChip :user="application.applicant" />
        </div>
      </v-list-item>
      <v-divider />
      <PrivacySettings v-model="application" />
    </v-list>

    <div class="text-h6 mt-4">{{ $t('Application content') }}</div>

    <v-list density="compact" v-if="application.forbidden">
      <v-list-item class="text-error">{{ $t('Confidential') }}</v-list-item>
    </v-list>

    <v-list density="compact" v-else-if="formData.length">
      <template v-for="(field, index) in formData" :key="`field_${index}`">
        <v-divider />
        <v-list-item>
          <div class="d-flex justify-space-between align-center">
            <span>{{ field.label }}</span>

            <span v-if="field.type === 'pdf'">
              <template v-if="field.value">
                <div v-if="userAsRecipient">
                  <span
                    v-if="userHasStampedAttachment(String(field.value))"
                    class="text-success text-center d-block mb-1"
                    >{{ $t('Stamped') }}</span
                  >
                  <span v-else class="text-error text-center d-block mb-1">{{
                    $t('Not stamped yet')
                  }}</span>
                </div>
                <v-btn @click="$emit('pdfSelected', String(field.value))" block>
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
            </span>

            <span v-else-if="field.type === 'file'">
              <v-btn
                v-if="field.value"
                @click="downloadAttachment(String(field.value))"
                block
              >
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </span>

            <span v-else-if="field.type === 'checkbox'">
              <v-icon v-if="field.value">mdi-check</v-icon>
              <v-icon v-else>mdi-close</v-icon>
            </span>

            <span v-else-if="field.type === 'link'">
              <a :href="String(field.value)" target="_blank">{{
                field.value
              }}</a>
            </span>

            <span v-else-if="field.type === 'application'">
              <a :href="`/applications/${field.value}`" target="_blank">{{
                field.value
              }}</a>
            </span>

            <span v-else class="application_field_value">{{
              field.value ?? '-'
            }}</span>
          </div>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Application, Field, Hanko } from '@/types'
import { useDateUtils } from '@/composables/useDateUtils'
import UserChip from '@/components/UserChip.vue'
import { env } from '@/utils/env'
import { useAuth } from '@/composables/useAuth'
import PrivacySettings from './PrivacySettings.vue'

const props = defineProps<{ modelValue: Application }>()
const emit = defineEmits<{
  'update:modelValue': [value: Application]
  pdfSelected: [fileId: string]
}>()

const route = useRoute()
const { formatDateNeo4j } = useDateUtils()
const { currentUser } = useAuth()

const application = computed({
  get: () => props.modelValue,
  set: (val: Application) => emit('update:modelValue', val),
})

const userAsRecipient = computed(() => {
  if (!currentUser.value) return null

  return (
    application.value.recipients?.find(
      (r) => r._id === currentUser.value?._id
    ) ?? null
  )
})

const formData = computed<Field[]>(() => {
  const fd = application.value.form_data
  if (!fd) return []
  if (typeof fd === 'string') {
    try {
      return JSON.parse(fd) as Field[]
    } catch {
      return []
    }
  }
  return fd
})

function downloadAttachment(fileId: string) {
  const base = env.VITE_SHINSEI_MANAGER_URL
  const appId = route.params.application_id as string
  window.open(`${base}/applications/${appId}/files/${fileId}`, '_blank')
}

function userHasStampedAttachment(fileId: string): boolean {
  if (!userAsRecipient.value) return false
  const approval = userAsRecipient.value.approval
  if (!approval) return false

  let hankos = approval.attachment_hankos
  if (!hankos) return false
  if (typeof hankos === 'string') {
    try {
      hankos = JSON.parse(hankos) as Hanko[]
    } catch {
      return false
    }
  }
  return hankos.some((h) => h.file_id === fileId)
}
</script>

<style scoped>
.application_field_value {
  white-space: pre-line;
}
</style>
