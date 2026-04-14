<template>
  <v-card :loading="loading">
    <template v-if="application && !error">
      <v-toolbar flat>
        <v-toolbar-title>
          {{ application?.title || $t('Application') }}
        </v-toolbar-title>

        <v-spacer />

        <HelpDialog />

        <template v-if="user_is_applicant">
          <v-btn variant="text" @click="go_to_resubmit">
            <v-icon start>mdi-restore</v-icon>
            {{ $t('Re-submit') }}
          </v-btn>

          <v-btn
            variant="text"
            :disabled="isApplicationFullyApproved"
            color="error"
            @click="open_delete_dialog"
          >
            <v-icon start>mdi-delete</v-icon>
            {{ $t('Delete') }}
          </v-btn>
        </template>
      </v-toolbar>

      <v-divider />

      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <ApplicationFormContent
              v-model="application"
              @pdfSelected="viewPdf"
            />
          </v-col>

          <v-col>
            <v-row v-if="isCurrentRecipientCurrentUser" class="mb-3">
              <v-spacer />

              <v-col cols="auto">
                <v-btn color="success" @click="open_approve_dialog">
                  <v-icon start>mdi-check</v-icon>
                  {{ $t('Approve') }}
                </v-btn>
              </v-col>

              <v-col cols="auto">
                <v-btn color="error" @click="open_reject_dialog">
                  <v-icon start>mdi-close</v-icon>
                  {{ $t('Reject') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-row justify="end" align="end" class="flex-wrap-reverse">
              <template v-if="isUserRecipient && !current_recipient">
                <v-col cols="auto">
                  <EmailButton
                    :application="application"
                    :user="application.applicant"
                  />
                </v-col>

                <v-col cols="auto">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-col>
              </template>

              <template
                v-for="(recipient, index) in ordered_recipients"
                :key="`recipient_${index}`"
              >
                <v-col cols="auto" v-if="index > 0">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-col>

                <v-col cols="auto">
                  <WebHankoContainer
                    :recipient="recipient"
                    :application="application"
                    @reject="open_reject_dialog"
                  />
                </v-col>
              </template>
            </v-row>

            <RecipientComments
              :application="application"
              @comment_updated="getApplication"
            />
          </v-col>
        </v-row>
      </v-container>

      <v-card-text>
        <PdfViewer
          v-if="selected_file_id"
          :selected-file-id="selected_file_id"
          :application="application"
          @pdf_stamped="getApplication"
        />
      </v-card-text>
    </template>

    <v-card-text v-if="error" class="text-center text-h6 text-error">
      {{ error }}
    </v-card-text>

    <!-- Dialog -->
    <v-dialog v-model="dialog.visible" max-width="400">
      <v-card>
        <v-card-title>{{ dialog.title }}</v-card-title>
        <v-card-text>{{ dialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog.visible = false">Cancel</v-btn>
          <v-btn color="primary" @click="dialogConfirm">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import HelpDialog from '@/components/application/HelpDialog.vue'
import EmailButton from '@/components/application/EmailButton.vue'
import PdfViewer from '@/components/application/PdfViewer.vue'
import RecipientComments from '@/components/application/RecipientComments.vue'
import ApplicationFormContent from '@/components/application/ApplicationFormContent.vue'
import type { Application } from '@/types'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import WebHankoContainer from '@/components/application/WebHankoContainer.vue'

const router = useRouter()
const route = useRoute()
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

const application_id = computed(() => route.params.application_id as string)

const ordered_recipients = computed(() => {
  if (!application.value) return []
  return [...application.value.recipients].sort(
    (a, b) => b.submission.flow_index - a.submission.flow_index
  )
})

const current_recipient = computed(() => {
  if (!application.value) return null
  if (application.value.recipients.some((r) => r.refusal)) return null

  return (
    [...application.value.recipients]
      .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
      .find((r) => !r.approval && !r.refusal) || null
  )
})

const user_is_applicant = computed(() => {
  if (!application.value || !currentUser.value) return false
  return application.value.applicant?._id === currentUser.value._id
})

const isUserRecipient = computed(() => {
  if (!application.value || !currentUser.value) return false
  return application.value.recipients.some(
    (r) => r._id === currentUser.value?._id
  )
})

const isCurrentRecipientCurrentUser = computed(() => {
  if (!isUserRecipient || !current_recipient.value || !currentUser.value)
    return false
  return current_recipient.value._id === currentUser.value._id
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
    const { data } = await api.get(`/applications/${application_id.value}`)

    if (data.form_data) {
      data.form_data = JSON.parse(data.form_data)
    }

    application.value = data
  } catch (err: any) {
    toast.error('Failed to load application')
    error.value = 'Application not found'
  } finally {
    loading.value = false
  }
}

function viewPdf(file_id: string) {
  selected_file_id.value = file_id
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

function open_approve_dialog() {
  openDialog('Approve', 'Approve this application?', approve_application)
}

function open_reject_dialog() {
  openDialog('Reject', 'Reject this application?', reject_application)
}

function open_delete_dialog() {
  openDialog('Delete', 'Delete this application?', delete_application)
}

async function approve_application() {
  try {
    await api.post(`/applications/${application_id.value}/approve`)
    toast.success('Application approved')
    await getApplication()
  } catch {
    toast.error('Error approving application')
  }
}

async function reject_application() {
  try {
    await api.post(`/applications/${application_id.value}/reject`)
    toast.success('Application rejected')
    await getApplication()
  } catch {
    toast.error('Error rejecting application')
  }
}

async function delete_application() {
  try {
    await api.delete(`/applications/${application_id.value}`)
    toast.success('Application deleted')
    router.push({ name: 'submitted_applications' })
  } catch {
    toast.error('Error deleting application')
  }
}

function go_to_resubmit() {
  router.push({
    name: 'new_application',
    query: { copy_of: application.value?._id },
  })
}

onMounted(getApplication)
</script>
