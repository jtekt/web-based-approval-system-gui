<template>
  <v-card variant="text">
    <template #title>
      {{ $t('Application info') }}
    </template>

    <template #text>
      <v-list>
        <v-divider />
        <v-list-item>
          <v-row>
            <v-col cols="4" class="d-flex align-center text-medium-emphasis"
              >ID</v-col
            >
            <v-col cols="8" class="text-body-small">{{
              application._id
            }}</v-col>
          </v-row>
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-row>
            <v-col cols="4" class="d-flex align-center text-medium-emphasis">{{
              $t('Title')
            }}</v-col>
            <v-col cols="8" class="text-body-2">{{ application.title }}</v-col>
          </v-row>
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-row>
            <v-col cols="4" class="d-flex align-center text-medium-emphasis">{{
              $t('Type')
            }}</v-col>
            <v-col cols="8">{{ application.type }}</v-col>
          </v-row>
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-row>
            <v-col cols="4" class="d-flex align-center text-medium-emphasis">{{
              $t('Date')
            }}</v-col>
            <v-col cols="8">
              {{
                application.creation_date
                  ? formatDateNeo4j(application.creation_date)
                  : '-'
              }}
            </v-col>
          </v-row>
        </v-list-item>
        <v-divider />
        <v-list-item>
          <v-row>
            <v-col cols="4" class="d-flex align-center text-medium-emphasis">{{
              $t('Applicant')
            }}</v-col>
            <v-col cols="8">
              <UserChip :user="application.applicant" />
            </v-col>
          </v-row>
        </v-list-item>
        <v-divider />

        <!-- PRIVACY -->
        <PrivacySettings v-model="application" />
      </v-list>
    </template>
  </v-card>

  <v-divider />

  <v-card variant="text">
    <template #title>
      {{ $t('Application content') }}
    </template>

    <template #text>
      <!-- CONFIDENTIAL -->
      <v-alert
        v-if="application.forbidden"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        {{ $t('Confidential') }}
      </v-alert>

      <!-- FIELDS -->
      <v-list v-else density="comfortable">
        <template v-for="(field, index) in formData" :key="`field_${index}`">
          <v-divider />
          <v-list-item>
            <v-row>
              <!-- LABEL -->
              <v-col cols="6" class="d-flex align-center text-medium-emphasis">
                {{ field.label }}
              </v-col>

              <!-- VALUE / ACTION -->
              <v-col cols="6" class="text-right">
                <!-- PDF -->
                <template v-if="field.type === 'pdf' && field.value">
                  <div v-if="userAsRecipient" class="mb-1">
                    <v-chip
                      size="x-small"
                      :color="
                        userHasStampedAttachment(String(field.value))
                          ? 'success'
                          : 'error'
                      "
                      variant="tonal"
                    >
                      {{
                        userHasStampedAttachment(String(field.value))
                          ? $t('Stamped')
                          : $t('Not stamped')
                      }}
                    </v-chip>
                  </div>

                  <v-btn
                    variant="tonal"
                    @click="$emit('pdfSelected', String(field.value))"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>

                <!-- FILE -->
                <template v-else-if="field.type === 'file' && field.value">
                  <v-btn
                    size="small"
                    variant="text"
                    @click="downloadAttachment(String(field.value))"
                  >
                    <v-icon start>mdi-download</v-icon>
                    {{ $t('Download') }}
                  </v-btn>
                </template>

                <!-- CHECKBOX -->
                <template v-else-if="field.type === 'checkbox'">
                  <v-icon :color="field.value ? 'success' : 'error'">
                    {{ field.value ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>

                <!-- LINK -->
                <template v-else-if="field.type === 'link' && field.value">
                  <a
                    :href="String(field.value)"
                    target="_blank"
                    class="text-primary text-decoration-none"
                  >
                    {{ field.value }}
                  </a>
                </template>

                <!-- APPLICATION -->
                <template
                  v-else-if="field.type === 'application' && field.value"
                >
                  <a
                    :href="`/applications/${field.value}`"
                    target="_blank"
                    class="text-primary text-decoration-none"
                  >
                    {{ field.value }}
                  </a>
                </template>

                <!-- DEFAULT -->
                <template v-else>
                  <span
                    v-if="field.value"
                    class="application_field_value text-body-2"
                  >
                    {{ field.value }}
                  </span>
                  <v-icon v-else color="grey">mdi-minus-circle</v-icon>
                </template>
              </v-col>
            </v-row>
          </v-list-item>
        </template>
      </v-list>
    </template>
  </v-card>
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

  let parsed: Field[] = []

  if (!fd) return []

  if (typeof fd === 'string') {
    try {
      parsed = JSON.parse(fd) as Field[]
    } catch {
      return []
    }
  } else {
    parsed = fd
  }

  if (!env.VITE_PDF_MODE) return parsed

  return parsed.filter((field) => field.type !== 'pdf')
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
