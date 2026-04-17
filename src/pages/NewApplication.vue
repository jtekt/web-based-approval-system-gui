<template>
  <v-card>
    <template #title>
      {{ $t('New submission') }}
    </template>

    <v-card variant="text">
      <template #title>
        {{ $t('Application info') }}
      </template>

      <template #text>
        <template v-if="!env.VITE_PDF_MODE">
          <!-- Copy mode -->
          <v-row v-if="copy_of">
            <v-col>
              <v-text-field
                :model-value="applicationForm?.label"
                :label="$t('Type')"
                :suffix="`(${$t('Resubmission of', { id: copy_of })})`"
                readonly
              />
            </v-col>

            <v-col cols="auto">
              <v-btn :to="{ name: 'new_application' }">
                <v-icon start>mdi-restore</v-icon>
                {{ $t('Start from scratch') }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Normal mode -->
          <v-row v-else>
            <v-col>
              <v-autocomplete
                :items="applicationFormTemplates"
                item-title="label"
                return-object
                v-model="applicationForm"
                :label="$t('Type')"
              />
            </v-col>
          </v-row>
        </template>

        <v-text-field v-model="title" :label="$t('Title')" />

        <v-switch
          :label="$t('Confidential')"
          v-model="confidential"
        />

        <v-expand-transition>
          <div v-if="confidential">
            <v-row align="center">
              <v-col cols="auto">
                {{ $t('Visibility') }}
              </v-col>

              <v-col cols="auto">
                <v-chip>
                  {{ $t('Approval flow') }}
                </v-chip>
              </v-col>

              <v-col class="d-flex flex-wrap">
                <GroupChip
                  v-for="group in groups"
                  :key="group._id"
                  :group="group"
                  closable
                  @click:close="removeGroup"
                />
              </v-col>

              <v-col cols="auto">
                <AddGroupDialog @selection="addGroup" />
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </template>
    </v-card>

    <v-divider />

    <v-card variant="text">
      <template #title>
        {{ $t('Application content') }}
      </template>

      <template #text>
        <div v-if="!applicationForm">
          {{ $t('Please select an application type') }}
        </div>

        <template v-else>
          <NewApplicationTemplateDetails
            v-if="!env.VITE_PDF_MODE"
            :selected-form="applicationForm"
          />
          <NewApplicationFormData v-model="applicationForm.fields" />
        </template>
      </template>
    </v-card>

    <v-divider />

    <!-- ===================== -->
    <!-- APPROVAL FLOW -->
    <!-- ===================== -->
    <v-card variant="text">
      <template #title>
        {{ $t('Approval flow') }}
      </template>

      <template #append>
        <v-btn color="error" @click="add_recipient_dialog = true">
          <v-icon start>mdi-account-plus</v-icon>
          {{ $t('Add recipient') }}
        </v-btn>

        <v-btn @click="saveRecipients">
          <v-icon start>mdi-content-save</v-icon>
          Save
        </v-btn>
      </template>

      <template #text>
        <div v-if="recipients.length">
          <NewApplicationApprovalFlow :recipients="recipients" />
        </div>

        <div v-else>
          {{ $t('Please select the recipients of this application') }}
        </div>
      </template>
    </v-card>

    <v-divider />

    <!-- ===================== -->
    <!-- SUBMIT -->
    <!-- ===================== -->
    <v-card variant="text">
      <template #actions>
        <v-spacer />

        <v-btn
          size="x-large"
          :loading="submitting"
          color="error"
          :disabled="!application_valid"
          @click="submit"
        >
          <v-icon start>mdi-send</v-icon>
          {{ $t('Submit application') }}
        </v-btn>

        <v-spacer />
      </template>
    </v-card>
  </v-card>

  <!-- ===================== -->
  <!-- DIALOG -->
  <!-- ===================== -->
  <v-dialog v-model="add_recipient_dialog">
    <v-card>
      <v-card-title class="text-h5">
        {{ $t('Add recipient') }}
      </v-card-title>

      <v-card-text>
        <UserPicker
          class="max-h-[300px] overflow-auto"
          @selection="addToRecipients"
          :groupManagerApiUrl="GROUP_MANAGER_API_URL"
          :group-manager-front-url="VITE_EMPLOYEE_MANAGER_FRONT_URL"
          :accessToken="accessToken"
        />
      </v-card-text>

      <v-card-text v-if="recipients.length">
        <NewApplicationApprovalFlow :recipients="recipients" />
      </v-card-text>

      <v-card-text v-else>
        {{ $t('No recipient selected') }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="add_recipient_dialog = false">
          {{ $t('Close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { UserPicker, type User } from '@moreillon/group-manager-vue-picker'
import NewApplicationApprovalFlow from '@/components/new_application/NewApplicationApprovalFlow.vue'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import NewApplicationFormData from '@/components/new_application/NewApplicationFormData.vue'
import NewApplicationTemplateDetails from '@/components/new_application/NewApplicationTemplateDetails.vue'
import GroupChip from '@/components/GroupChip.vue'
import type { Application, Field, Group, Recipient, Template } from '@/types'
import { env } from '@/utils/env'
import { localStorageRecipientsKey } from '@/constants'
import z from 'zod'
import { FieldSchema } from '@/schemas/application'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'

// ---- Setup ----

const route = useRoute()
const router = useRouter()

const { accessToken } = useAuth()

const defaultPDFForm: Template = {
  label: 'pdf',
  fields: [
    {
      label: 'file',
      type: 'pdf',
      value: null,
    },
    {
      type: 'text',
      label: 'Applicant comment',
      value: '',
    },
  ],
  groups: [],
  managers: [],
}

const applicationFormTemplates = ref<Template[]>([])
const applicationForm = ref<Template | null>(
  env.VITE_PDF_MODE ? defaultPDFForm : null
)

const title = ref<string>('')
const confidential = ref<boolean>(false)
const recipients = ref<Recipient[]>(getRecipientsFromLocalStorage())
const groups = ref<Group[]>([])

const add_recipient_dialog = ref<boolean>(false)
const submitting = ref<boolean>(false)

const GROUP_MANAGER_API_URL = env.VITE_GROUP_MANAGER_API_URL
const VITE_EMPLOYEE_MANAGER_FRONT_URL = env.VITE_EMPLOYEE_MANAGER_FRONT_URL
// ---- Computed ----

const copy_of = computed<string | null>(() => {
  return (route.query.copy_of as string) || null
})

const application_valid = computed<boolean>(() => {
  return (
    title.value !== '' && recipients.value.length > 0 && !!applicationForm.value
  )
})

// ---- Methods ----

async function getTemplates(): Promise<void> {
  if (env.VITE_PDF_MODE) return

  try {
    const { data } = await api.get<Template[]>('/templates')
    applicationFormTemplates.value = data

    const template = route.query.template as string
    if (template) {
      applicationForm.value =
        applicationFormTemplates.value.find((t) => t.label === template) || null
    }
  } catch (err) {
    console.error(err)
  }
}

async function submit(): Promise<void> {
  submitting.value = true

  try {
    const recipients_ids = recipients.value.map(
      (r) => r._id || r.properties?._id
    )

    const group_ids = groups.value.map((g) => g._id || g.properties?._id)
    const form_data = applicationForm.value?.fields

    const type = env.VITE_PDF_MODE ? 'PDF' : applicationForm.value?.label

    const body = {
      title: title.value,
      type,
      form_data,
      private: confidential.value,
      recipients_ids,
      group_ids,
    }

    const { data } = await api.post<Application>('/applications', body)

    router.push({ name: 'application', params: { application_id: data._id } })
  } catch (err) {
    console.error(err)
    alert(err)
  } finally {
    submitting.value = false
  }
}

function addToRecipients(newRecipient: User): void {
  const exists = recipients.value.find(
    (r) => (r._id || r.properties?._id) === newRecipient._id
  )
  if (exists) return alert('Duplicates not allowed')

  // TODO validate here
  recipients.value.push({ ...newRecipient, submission: { flow_index: 0 } })
}

function addGroup(group: Group): void {
  if (groups.value.some((g) => g._id === group._id)) return
  groups.value.push(group)
}

function removeGroup(group: Group): void {
  groups.value = groups.value.filter((g) => g._id !== group._id)
}

function saveRecipients(): void {
  localStorage.setItem(
    localStorageRecipientsKey,
    JSON.stringify(recipients.value)
  )
  alert('承認フローが保存されました')
}

function getRecipientsFromLocalStorage(): Recipient[] {
  const item = localStorage.getItem(localStorageRecipientsKey)
  return item ? JSON.parse(item) : []
}

async function recreateApplicationContent(): Promise<void> {
  if (!copy_of.value) return

  try {
    const { data } = await api.get<Application>(
      `/applications/${copy_of.value}`
    )

    title.value = data.title
    confidential.value = !!data.private

    const parseFormData = (input: unknown): Field[] => {
      if (!input) return []

      try {
        const raw = typeof input === 'string' ? JSON.parse(input) : input

        return z.array(FieldSchema).parse(raw)
      } catch {
        return []
      }
    }

    groups.value = data.visibility || []

    recipients.value = data.recipients
      .slice()
      .sort((a, b) => a.submission.flow_index - b.submission.flow_index)

    applicationForm.value = {
      label: env.VITE_PDF_MODE ? 'pdf' : data.type,
      fields: env.VITE_PDF_MODE ? [] : parseFormData(data.form_data),
      managers: [],
      groups: data.visibility || [],
    }
  } catch (err) {
    console.error(err)
  }
}

// ---- Lifecycle ----

onMounted(async () => {
  await getTemplates()
  if (copy_of.value) await recreateApplicationContent()
})

watch(copy_of, (val) => {
  if (!val) {
    applicationForm.value = null
    groups.value = []
    recipients.value = getRecipientsFromLocalStorage()
    title.value = ''
  }
})
</script>
