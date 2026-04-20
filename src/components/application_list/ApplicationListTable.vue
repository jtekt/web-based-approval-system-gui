<template>
  <v-data-table-server
    v-model:options="options"
    :loading="loading"
    :items="applications"
    :headers="headers"
    :items-length="application_count"
    @click:row="row_clicked"
  >
    <template #body v-if="error">
      <tr>
        <td :colspan="headers.length" class="text-error pa-4">
          An error occurred while loading data
        </td>
      </tr>
    </template>

    <template #item.creation_date="{ item }">
      <span>
        {{ item.creation_date ? formatDateNeo4j(item.creation_date) : '' }}
      </span>
    </template>

    <template #item.progress="{ item }">
      <v-progress-linear :model-value="item.progress" height="8" rounded />
    </template>

    <template #item.current_recipient="{ item }">
      <UserChip
        v-if="item.current_recipient"
        :user="item.current_recipient"
        :link="false"
      />
    </template>

    <template #item.applicant="{ item }">
      <UserChip :user="item.applicant" :link="false" />
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Application, Recipient } from '@/types'
import { useDateUtils } from '@/composables/useDateUtils'
import { ApplicationSchema } from '@/schemas/application'
import { PagedApplicationsSchema } from '@/schemas/common'
import UserChip from '@/components/UserChip.vue'
import api from '@/api'
import { env } from '@/utils/env'

const props = defineProps<{
  direction: string
  headers: { title: string; key: string; width?: string }[]
}>()

const route = useRoute()
const router = useRouter()
const { formatDateNeo4j } = useDateUtils()

const loading = ref(false)
const applications = ref<Application[]>([])
const application_count = ref(0)
const error = ref<string | null>(null)

const options = ref({
  page: 1,
  itemsPerPage: 10,
})

const relationship_lookup: Record<string, string> = {
  submitted: 'SUBMITTED_BY',
  received: 'SUBMITTED_TO',
}

/**
 * SINGLE SOURCE OF TRUTH
 * This is the ONLY place that triggers API calls
 */
watch(
  [options, () => route.query.state, () => props.direction],
  () => {
    get_applications()
  },
  { deep: true }
)

function get_applications() {
  loading.value = true
  error.value = null

  const state = route.query.state || 'pending'

  const params = {
    start_index: (options.value.page - 1) * options.value.itemsPerPage,
    batch_size: options.value.itemsPerPage,
    relationship: relationship_lookup[props.direction],
    state,
    type: env.VITE_PDF_ONLY && 'PDF',
  }

  api
    .get<{
      count: number
      applications: Application[]
      start_index: number
      batch_size: number
    }>('/applications', { params })
    .then(({ data }) => {
      const parsed = PagedApplicationsSchema(ApplicationSchema).safeParse(data)

      const items = parsed.success
        ? parsed.data.applications
        : data.applications

      application_count.value = parsed.success ? parsed.data.count : data.count

      applications.value = items.map((app) => {
        const current_recipient = app.recipients
          .slice()
          .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
          .find((r) => !r.approval)

        const approval_count = app.recipients.filter((r) => r.approval).length

        const progress = app.recipients.length
          ? (100 * approval_count) / app.recipients.length
          : 0

        return { ...app, current_recipient, progress }
      })
    })
    .catch((err) => {
      console.error(err)
      error.value = String(err)
    })
    .finally(() => {
      loading.value = false
    })
}

function row_clicked(_event: Event, row: { item: Application }) {
  router.push({
    name: 'application',
    params: { application_id: row.item._id },
  })
}
</script>
