<template>
  <v-card :loading="loading">
    <v-toolbar flat>
      <v-btn exact icon :to="{ name: 'templates' }">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ template?.label ?? $t('Template') }}</v-toolbar-title>
      <v-spacer />
      <template v-if="userIsManager">
        <v-btn
          variant="text"
          color="error"
          :loading="deleting"
          @click="deleteTemplate"
        >
          <v-icon start>mdi-delete</v-icon>
          <span>{{ $t('Delete') }}</span>
        </v-btn>
        <v-btn variant="text" :loading="saving" @click="updateTemplate">
          <v-icon start>mdi-content-save</v-icon>
          <span>{{ $t('Save') }}</span>
        </v-btn>
      </template>
    </v-toolbar>
    <v-divider />

    <template v-if="template">
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              :readonly="!userIsManager"
              :label="$t('Template name')"
              v-model="template.label"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-textarea
              :label="$t('Description')"
              auto-grow
              rows="1"
              :readonly="!userIsManager"
              v-model="template.description"
            />
          </v-col>
        </v-row>

        <!-- Visibility -->
        <v-row align="center">
          <v-col cols="auto">{{ $t('Visibility') }}</v-col>
          <v-col cols="auto"
            ><v-chip label variant="outlined">{{ $t('You') }}</v-chip></v-col
          >
          <v-col
            cols="auto"
            v-for="(group, index) in template.groups"
            :key="`group_${index}`"
          >
            <GroupChip
              :group="group"
              :closable="userIsManager"
              @click:close="removeGroup(index)"
            />
          </v-col>
          <v-col cols="auto">
            <AddGroupDialog v-if="userIsManager" @selection="addGroup" />
          </v-col>
        </v-row>

        <!-- Managers -->
        <v-row align="center">
          <v-col cols="auto">{{ $t('Managers') }}</v-col>
          <v-col
            cols="auto"
            v-for="(manager, index) in template.managers"
            :key="`manager_${index}`"
          >
            <UserChip :user="manager" />
          </v-col>
          <v-col cols="auto">
            <AddTemplateManagerDialog
              v-if="userIsManager"
              @selection="addManager"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Fields -->
      <v-card-text>
        <v-card variant="outlined">
          <v-toolbar flat>
            <v-toolbar-title>{{ $t('Fields') }}</v-toolbar-title>
            <v-spacer />
            <v-btn v-if="userIsManager" @click="addField">
              <v-icon start>mdi-plus</v-icon>
              <span>{{ $t('Add field') }}</span>
            </v-btn>
          </v-toolbar>
          <v-divider />
          <v-card-text>
            <v-row
              align="baseline"
              v-for="(field, index) in template.fields"
              :key="`field_${index}`"
            >
              <v-col>
                <v-text-field
                  :readonly="!userIsManager"
                  :label="$t('Field name')"
                  v-model="field.label"
                />
              </v-col>
              <v-col>
                <v-select
                  :readonly="!userIsManager"
                  :items="fieldTypes"
                  item-title="label"
                  item-value="type"
                  v-model="field.type"
                  label="Type"
                />
              </v-col>
              <v-col v-if="userIsManager" cols="auto">
                <v-btn
                  icon
                  :disabled="index === 0"
                  @click="moveField(index, -1)"
                >
                  <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
                <v-btn
                  icon
                  :disabled="index === template.fields.length - 1"
                  @click="moveField(index, 1)"
                >
                  <v-icon>mdi-arrow-down</v-icon>
                </v-btn>
              </v-col>
              <v-col v-if="userIsManager" cols="auto">
                <v-btn icon color="error" @click="deleteField(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
    </template>
  </v-card>
  <v-dialog v-model="confirmState.open" max-width="420">
    <v-card>
      <v-card-title class="text-h6">
        {{ confirmState.title }}
      </v-card-title>

      <v-card-text>
        {{ confirmState.message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirmState.open = false">
          {{ $t('Cancel') }}
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          :loading="confirmState.loading"
          @click="confirmState.onConfirm"
        >
          {{ $t('Confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Template, User, Group } from '@/types'
import UserChip from '@/components/UserChip.vue'
import GroupChip from '@/components/GroupChip.vue'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import AddTemplateManagerDialog from '@/components/templates/AddTemplateManagerDialog.vue'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const toast = useToast()

const template = ref<Template | null>(null)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const confirmState = ref<{
  open: boolean
  title: string
  message: string
  loading: boolean
  onConfirm: () => Promise<void> | void
}>({
  open: false,
  title: '',
  message: '',
  loading: false,
  onConfirm: () => {},
})

const templateId = computed(() => route.params.template_id as string)

const userIsManager = computed(() => {
  if (!template.value || !currentUser.value) return false
  return template.value.managers.some((m) => m._id === currentUser.value?._id)
})

const fieldTypes = computed(() => [
  { type: 'text', label: t('Text') },
  { type: 'file', label: t('File') },
  { type: 'pdf', label: t('PDF File') },
  { type: 'checkbox', label: t('Checkbox') },
  { type: 'date', label: t('Date') },
  { type: 'link', label: t('Link') },
  { type: 'application', label: t('Application ID') },
])

onMounted(() => getTemplate())

function getTemplate() {
  loading.value = true
  api
    .get<Template>(`/templates/${templateId.value}`)
    .then(({ data }) => {
      template.value = data
    })
    .catch(console.error)
    .finally(() => {
      loading.value = false
    })
}

async function updateTemplate() {
  if (!template.value) return

  saving.value = true
  const groupIds = template.value.groups.map((g) => g._id)
  const { fields, label, description } = template.value

  try {
    await api.put(`/templates/${templateId.value}`, {
      fields,
      label,
      description,
      group_ids: groupIds,
    })

    toast.success(t('Template updated'))
    router.push({ name: 'templates' })
  } catch (err) {
    console.error(err)
    toast.error(t('Failed to update template'))
  } finally {
    saving.value = false
  }
}

function deleteTemplate() {
  confirmState.value = {
    open: true,
    title: t('Delete template'),
    message: t('Are you sure you want to delete this template?'),
    loading: false,
    onConfirm: async () => {
      confirmState.value.loading = true
      deleting.value = true

      try {
        await api.delete(`/templates/${templateId.value}`)

        toast.success(t('Template deleted'))
        router.push({ name: 'templates' })
      } catch (err) {
        console.error(err)
        toast.error(t('Failed to delete template'))
      } finally {
        deleting.value = false
        confirmState.value.loading = false
        confirmState.value.open = false
      }
    },
  }
}

function addManager(user: User) {
  if (!template.value) return
  template.value.managers.push(user)
}

function addGroup(group: Group) {
  if (!template.value) return
  template.value.groups.push(group)
}

function removeGroup(index: number) {
  template.value?.groups.splice(index, 1)
}

function addField() {
  template.value?.fields.push({ type: 'text', label: '' })
}

function moveField(index: number, step: number) {
  if (!template.value) return
  const fields = template.value.fields
  const item = fields[index]
  const next = fields[index + step]
  fields[index + step] = item
  fields[index] = next
}

function deleteField(index: number) {
  confirmState.value = {
    open: true,
    // TODO: in18
    title: t('Delete field'),
    message: t('Are you sure you want to delete this field?'),
    loading: false,
    onConfirm: async () => {
      template.value?.fields.splice(index, 1)

      toast.success(t('Field removed'))

      confirmState.value.open = false
    },
  }
}
</script>
