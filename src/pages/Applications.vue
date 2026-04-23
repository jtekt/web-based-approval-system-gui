<template>
  <v-card>
    <template #prepend>
      <v-icon>
        {{ cardIcon }}
      </v-icon>
    </template>
    <template #title>{{ cardTitle }}</template>
    <template #append>
      <v-btn color="primary" :to="{ name: 'new_application' }">
        <v-icon start>mdi-plus</v-icon>
        <span>{{ $t('New application') }}</span>
      </v-btn>
    </template>

    <v-tabs v-model="tab">
      <v-tab
        v-for="table in currentTables"
        :key="table.state"
        :value="table.state"
      >
        <v-icon start>{{ table.icon }}</v-icon>
        <span>{{ table.title }}</span>
      </v-tab>
    </v-tabs>

    <v-divider />

    <ApplicationListTable
      v-if="currentTable"
      :direction="direction"
      :headers="currentTable.headers"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ApplicationListTable from '@/components/application_list/ApplicationListTable.vue'
import { useMode } from '@/composables/useMode'

const props = defineProps<{ direction: string }>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { mode } = useMode()

const cardTitle = computed(() =>
  props.direction === 'submitted' ? t('Outbox') : t('Inbox')
)
const cardIcon = computed(() =>
  props.direction === 'submitted'
    ? 'mdi-inbox-arrow-up'
    : 'mdi-inbox-arrow-down'
)

const tab = computed({
  get: () => (route.query.state as string) || 'pending',
  set: (state: string) => {
    const query = { ...route.query }
    if (state) query.state = state
    else delete query.state
    router.replace({ query })
  },
})

const currentTables = computed(() =>
  props.direction === 'submitted' ? submittedTables.value : receivedTables.value
)

const currentTable = computed(() =>
  currentTables.value.find((t) => t.state === tab.value)
)

const submittedTables = computed(() => [
  {
    title: t('Pending'),
    state: 'pending',
    icon: 'mdi-progress-clock',
    headers: [
      { title: t('Date'), key: 'creation_date', sortable: false },
      ...(mode.value === 'PDF'
        ? []
        : [{ title: t('Type'), key: 'type', sortable: false }]),
      { title: t('Title'), key: 'title', sortable: false },
      { title: '%', key: 'progress', width: '10ch', sortable: false },
      {
        title: t('Current recipient'),
        key: 'current_recipient',
        sortable: false,
      },
    ],
  },
  {
    title: t('Rejected'),
    state: 'rejected',
    icon: 'mdi-close-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date', sortable: false },
      ...(mode.value === 'PDF'
        ? []
        : [{ title: t('Type'), key: 'type', sortable: false }]),
      { title: t('Title'), key: 'title', sortable: false },
      { title: '%', key: 'progress', width: '10ch', sortable: false },
      {
        title: t('Current recipient'),
        key: 'current_recipient',
        sortable: false,
      },
    ],
  },
  {
    title: t('Approved'),
    state: 'approved',
    icon: 'mdi-check-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date', sortable: false },
      ...(mode.value === 'PDF'
        ? []
        : [{ title: t('Type'), key: 'type', sortable: false }]),
      { title: t('Title'), key: 'title', sortable: false },
    ],
  },
])

const receivedTables = computed(() => [
  {
    title: t('Pending'),
    state: 'pending',
    icon: 'mdi-progress-clock',
    headers: [
      { title: t('Date'), key: 'creation_date', sortable: false },
      ...(mode.value === 'PDF'
        ? []
        : [{ title: t('Type'), key: 'type', sortable: false }]),
      { title: t('Title'), key: 'title', sortable: false },
      { title: t('Applicant'), key: 'applicant', sortable: false },
    ],
  },
  {
    title: t('Rejected'),
    state: 'rejected',
    icon: 'mdi-close-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date', sortable: false },
      ...(mode.value === 'PDF'
        ? []
        : [{ title: t('Type'), key: 'type', sortable: false }]),
      { title: t('Title'), key: 'title', sortable: false },
      { title: t('Applicant'), key: 'applicant', sortable: false },
    ],
  },
  {
    title: t('Approved'),
    state: 'approved',
    icon: 'mdi-check-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date', sortable: false },
      ...(mode.value === 'PDF'
        ? []
        : [{ title: t('Type'), key: 'type', sortable: false }]),
      { title: t('Title'), key: 'title', sortable: false },
      { title: t('Applicant'), key: 'applicant', sortable: false },
    ],
  },
])
</script>
