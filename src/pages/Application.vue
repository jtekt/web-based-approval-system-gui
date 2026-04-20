<template>
  <v-card :loading="loading">
    <template #title>
      {{ application?.title || $t('Application') }}
    </template>
    <template v-if="isUserApplicant" #append>
      <HelpDialog />

      <v-btn variant="text" @click="goToResubmit">
        <v-icon start>mdi-restore</v-icon>
        {{ $t('Re-submit') }}
      </v-btn>

      <v-btn
        variant="text"
        :disabled="isApplicationFullyApproved"
        color="error"
        @click="openDeleteDialog"
      >
        <v-icon start>mdi-delete</v-icon>
        {{ $t('Delete') }}
      </v-btn>
    </template>
    <v-divider />

    <template v-if="application && !error">
      <v-row>
        <v-col cols="12" md="6">
          <ApplicationFormContent
            v-model="application"
            @pdfSelected="viewPdf"
          />

          <v-divider md="hidden" />
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="text">
            <template #title>
              {{ $t('Approval') }}
            </template>
            <template #append>
              <v-row
                density="compact"
                v-if="!env.VITE_PDF_ONLY && isCurrentRecipientCurrentUser"
              >
                <v-col cols="auto">
                  <v-btn color="success" @click="openApproveDialog">
                    <v-icon start>mdi-check</v-icon>
                    {{ $t('Approve') }}
                  </v-btn>
                </v-col>

                <v-col cols="auto">
                  <v-btn color="error" @click="openRejectDialog">
                    <v-icon start>mdi-close</v-icon>
                    {{ $t('Reject') }}
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <template #text>
              <v-row class="d-flex align-center justify-end" no-gutters>
                <template v-if="isUserRecipient && !currentRecipient">
                  <div class="d-flex align-center">
                    <EmailButton
                      :application="application"
                      :user="application.applicant"
                    />
                    <v-icon class="mx-2">mdi-arrow-left</v-icon>
                  </div>
                </template>

                <!-- Recipients -->
                <template
                  v-for="(recipient, index) in orderedRecipients"
                  :key="`recipient_${index}`"
                >
                  <div class="d-flex align-center">
                    <template v-if="index > 0">
                      <v-icon class="mx-2">mdi-arrow-left</v-icon>
                    </template>

                    <WebHankoContainer
                      :recipient="recipient"
                      :application="application"
                      @reject="openRejectDialog"
                    />
                  </div>
                </template>
              </v-row>
            </template>
          </v-card>

          <v-divider />

          <v-card variant="text">
            <template #title>
              {{ $t('Recipient comments') }}
            </template>

            <template #text>
              <v-row no-gutters>
                <v-col
                  v-for="(recipient, index) in orderedRecipients"
                  :key="`comment_${index}`"
                  cols="12"
                >
                  <RecipientComment
                    :recipient="recipient"
                    @comment_updated="getApplication"
                  />
                </v-col>
              </v-row>
            </template>
          </v-card>
        </v-col>
      </v-row>
      <PdfViewer
        v-if="selected_file_id"
        :key="selected_file_id"
        :selected-file-id="selected_file_id"
        :application="application"
        @pdf_stamped="getApplication"
      />
    </template>

    <v-card-text v-else-if="error" class="text-center text-h6 text-error">
      {{ error }}
    </v-card-text>
  </v-card>

  <!-- Dialog -->
  <v-dialog v-model="dialog.visible" max-width="400">
    <v-card>
      <v-card-title>{{ dialog.title }}</v-card-title>
      <v-card-text>{{ dialog.message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog.visible = false">{{ $t('Cancel') }}</v-btn>
        <v-btn color="primary" @click="dialogConfirm">{{ $t('OK') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import HelpDialog from '@/components/application/HelpDialog.vue'
import EmailButton from '@/components/application/EmailButton.vue'
import PdfViewer from '@/components/application/PdfViewer.vue'
import ApplicationFormContent from '@/components/application/ApplicationFormContent.vue'
import type { Application } from '@/types'
import api from '@/api'
import { env } from '@/utils/env'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import WebHankoContainer from '@/components/application/WebHankoContainer.vue'
import RecipientComment from '@/components/application/RecipientComment.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()
const { currentUser } = useAuth()

const application = ref<Application | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selected_file_id = ref<string | null>(null)

const dialog = ref({
  visible: false,
  title: '',
  message: '',
  action: null as null | (() => Promise<void>),
})

const orderedRecipients = computed(() => {
  if (!application.value) return []
  return [...application.value.recipients].sort(
    (a, b) => b.submission.flow_index - a.submission.flow_index
  )
})

const currentRecipient = computed(() => {
  if (!application.value) return null
  if (application.value.recipients.some((r) => r.refusal)) return null

  return (
    [...application.value.recipients]
      .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
      .find((r) => !r.approval && !r.refusal) || null
  )
})

const isUserApplicant = computed(() => {
  if (!application.value || !currentUser.value) return false
  return application.value.applicant?._id === currentUser.value._id
})

const isUserRecipient = computed(() => {
  if (!isUserApplicant.value || !application.value || !currentUser.value)
    return false
  return application.value.recipients.some(
    (r) => r._id === currentUser.value?._id
  )
})

const isCurrentRecipientCurrentUser = computed(() => {
  if (!isUserRecipient || !currentRecipient.value || !currentUser.value)
    return false
  return currentRecipient.value._id === currentUser.value._id
})

const isApplicationFullyApproved = computed(() => {
  if (!application.value) return false

  const total = application.value.recipients.length
  const approved = application.value.recipients.reduce(
    (acc, r) => acc + (r.approval ? 1 : 0),
    0
  )

  return total === approved
})

async function getApplication() {
  loading.value = true
  error.value = null

  try {
    const { data } = await api.get<Application>(
      `/applications/${route.params.application_id}`
    )

    if (data.form_data && typeof data.form_data === 'string') {
      data.form_data = JSON.parse(data.form_data)
    }

    application.value = data

    if (env.VITE_PDF_ONLY && Array.isArray(data.form_data)) {
      const pdfField = data.form_data.find((f) => f.type === 'pdf' && f.value)
      if (pdfField) {
        const newId = String(pdfField.value)

        if (selected_file_id.value !== newId) {
          selected_file_id.value = newId
        }
      }
    }
  } catch (err: any) {
    toast.error(t('Failed to load application'))
    error.value = t('Application not found')
  } finally {
    loading.value = false
  }
}

function viewPdf(file_id: string) {
  selected_file_id.value = selected_file_id.value === file_id ? null : file_id
}

function openDialog(
  title: string,
  message: string,
  action: () => Promise<void>
) {
  dialog.value = { visible: true, title, message, action }
}

function dialogConfirm() {
  if (dialog.value.action) dialog.value.action()
  dialog.value.visible = false
}

function openApproveDialog() {
  openDialog(t('Approve'), t('Approve application'), approveApplication)
}

function openRejectDialog() {
  openDialog(t('Reject'), t('Reject application'), rejectApplication)
}

function openDeleteDialog() {
  openDialog(t('Delete'), t('Delete this application form'), deleteApplication)
}

async function approveApplication() {
  try {
    await api.post(`/applications/${route.params.application_id}/approve`)
    toast.success(t('Application approved'))
    await getApplication()
  } catch {
    toast.error(t('Error approving application'))
  }
}

async function rejectApplication() {
  try {
    await api.post(`/applications/${route.params.application_id}/reject`)
    toast.success(t('Application rejected'))
    await getApplication()
  } catch {
    toast.error(t('Error rejecting application'))
  }
}

async function deleteApplication() {
  try {
    await api.delete(`/applications/${route.params.application_id}`)
    toast.success(t('Application deleted'))
    router.push({ name: 'submitted_applications' })
  } catch {
    toast.error(t('Error deleting application'))
  }
}

function goToResubmit() {
  router.push({
    name: 'new_application',
    query: { copy_of: application.value?._id },
  })
}

onMounted(getApplication)
</script>
