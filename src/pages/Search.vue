<template>
  <v-card>
    <v-card-title>{{ $t('Search') }}</v-card-title>
    <v-card-text>
      <v-card variant="outlined">
        <v-card-title>{{ $t('Filters') }}</v-card-title>
        <v-form @submit.prevent="search">
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field :label="$t('Stamp ID')" v-model="hankoId" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('Application ID')"
                  v-model="applicationId"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-combobox
                  :label="$t('Application type')"
                  :items="applicationTypes"
                  v-model="applicationType"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <DatePicker :label="$t('From')" v-model="startDate" />
              </v-col>
              <v-col>
                <DatePicker :label="$t('To')" v-model="endDate" />
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="auto">{{ $t('Applicant') }}{{ $t('Group') }}</v-col>
              <v-col cols="auto">
                <v-chip
                  v-if="selectedGroup"
                  closable
                  @click:close="selectedGroup = null"
                  >{{ selectedGroup.name }}</v-chip
                >
                <AddGroupDialog v-else @selection="selectGroup" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :label="$t('Relationship')"
                  :items="relationshipTypes"
                  item-title="text"
                  item-value="value"
                  v-model="relationshipType"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :label="$t('Approval state')"
                  :items="approvalStates"
                  item-title="text"
                  item-value="value"
                  v-model="approvalState"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn type="submit">
                  <v-icon start>mdi-magnify</v-icon>
                  <span>{{ $t('Search') }}</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-form>
      </v-card>
    </v-card-text>

    <v-card-text>
      <v-data-table-server
        :loading="loading"
        :items="applications"
        :headers="headers"
        :items-length="count"
        :items-per-page="itemsPerPage"
        :page="page"
        @update:options="loadItems"
        @click:row="rowClicked"
      >
        <template #item.creation_date="{ item }">
          {{ item.creation_date ? formatDate(item.creation_date) : '' }}
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import type { Application, Group } from '@/types'
import { useIdUtils } from '@/composables/useIdUtils'
import { PagedApplicationsSchema } from '@/schemas/common'
import { ApplicationSchema } from '@/schemas/application'
import type { Neo4jDate } from '@/types'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import DatePicker from '@/components/DatePicker.vue'

const { t } = useI18n()
const router = useRouter()
const { getIdOfItem } = useIdUtils()

const loading = ref(false)
const applications = ref<Application[]>([])
const count = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

const applicationTypes = ref<string[]>([])
const applicationType = ref<string | null>(null)
const applicationId = ref<string | null>(null)
const hankoId = ref<string | null>(null)
const relationshipType = ref<string | null>(null)
const approvalState = ref<string | null>(null)
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)
const selectedGroup = ref<Group | null>(null)

const selectedGroupId = computed(() =>
  selectedGroup.value ? getIdOfItem(selectedGroup.value) : null
)

const headers = computed(() => [
  { title: t('Date'), key: 'creation_date' },
  { title: t('Title'), key: 'title' },
  { title: t('Type'), key: 'type' },
  { title: t('Applicant'), key: 'applicant.display_name' },
])

const approvalStates = computed(() => [
  { text: t('Any'), value: null },
  { text: t('Approved'), value: 'approved' },
])

const relationshipTypes = computed(() => [
  { value: null, text: t('Any') },
  { value: 'SUBMITTED_BY', text: t('Submitted by you') },
  { value: 'SUBMITTED_TO', text: t('Submitted to you') },
  { value: 'REJECTED', text: t('Rejected by you') },
  { value: 'APPROVED', text: t('Approved by you') },
])

onMounted(() => getApplicationTypes())

function getApplicationTypes() {
  axios
    .get<string[]>('/applications/types')
    .then(({ data }) => {
      applicationTypes.value = data
    })
    .catch(console.error)
}

function loadItems(options: { page: number; itemsPerPage: number }) {
  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
  getApplications()
}

function search() {
  page.value = 1
  getApplications()
}

function getApplications() {
  loading.value = true
  const params = {
    hanko_id: hankoId.value || undefined,
    application_id: applicationId.value || undefined,
    relationship: relationshipType.value || undefined,
    type: applicationType.value || undefined,
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
    group_id: selectedGroupId.value || undefined,
    state: approvalState.value || undefined,
    start_index: (page.value - 1) * itemsPerPage.value,
    batch_size: itemsPerPage.value,
  }

  axios
    .get<{ applications: Application[]; count: number }>('/applications', {
      params,
    })
    .then(({ data }) => {
      const parsed = PagedApplicationsSchema(ApplicationSchema).safeParse(data)
      if (parsed.success) {
        applications.value = parsed.data.applications
        count.value = parsed.data.count
      } else {
        applications.value = data.applications
        count.value = data.count
      }
    })
    .catch(console.error)
    .finally(() => {
      loading.value = false
    })
}

function selectGroup(group: Group) {
  selectedGroup.value = group
}

function rowClicked(_event: Event, row: { item: Application }) {
  const id = getIdOfItem(row.item)
  router.push({ name: 'application', params: { application_id: id } })
}

function formatDate(date: Neo4jDate): string {
  const { year, month, day } = date
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )}`
}
</script>
