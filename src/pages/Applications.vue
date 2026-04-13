<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title class="text-h4">{{ cardTitle }}</v-toolbar-title>
      <v-spacer />
      <v-btn color="primary" :to="{ name: 'new_application' }">
        <v-icon start>mdi-plus</v-icon>
        <span>{{ $t('New application') }}</span>
      </v-btn>
      <template #extension>
        <v-tabs v-model="tab" align-tabs="title">
          <v-tab
            v-for="table in currentTables"
            :key="table.state"
            :value="table.state"
          >
            <v-icon start>{{ table.icon }}</v-icon>
            <span>{{ table.title }}</span>
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-divider />

    <v-card-text>
      <ApplicationListTable
        v-if="currentTable"
        :direction="direction"
        :headers="currentTable.headers"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ApplicationListTable from '@/components/application_list/ApplicationListTable.vue'

const props = defineProps<{ direction: string }>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const cardTitle = computed(() =>
  props.direction === 'submitted' ? t('Outbox') : t('Inbox')
)

const tab = computed({
  get: () => (route.query.state as string) || 'pending',
  set: (state: string) => {
    const query = { ...route.query }
    if (state && state !== 'pending') query.state = state
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
      { title: t('Date'), key: 'creation_date' },
      { title: t('Type'), key: 'type' },
      { title: t('Title'), key: 'title' },
      { title: '%', key: 'progress', width: '10ch' },
      { title: t('Current recipient'), key: 'current_recipient' },
    ],
  },
  {
    title: t('Rejected'),
    state: 'rejected',
    icon: 'mdi-close-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date' },
      { title: t('Type'), key: 'type' },
      { title: t('Title'), key: 'title' },
      { title: '%', key: 'progress', width: '10ch' },
      { title: t('Current recipient'), key: 'current_recipient' },
    ],
  },
  {
    title: t('Approved'),
    state: 'approved',
    icon: 'mdi-check-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date' },
      { title: t('Type'), key: 'type' },
      { title: t('Title'), key: 'title' },
    ],
  },
])

const receivedTables = computed(() => [
  {
    title: t('Pending'),
    state: 'pending',
    icon: 'mdi-progress-clock',
    headers: [
      { title: t('Date'), key: 'creation_date' },
      { title: t('Type'), key: 'type' },
      { title: t('Title'), key: 'title' },
      { title: t('Applicant'), key: 'applicant' },
    ],
  },
  {
    title: t('Rejected'),
    state: 'rejected',
    icon: 'mdi-close-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date' },
      { title: t('Type'), key: 'type' },
      { title: t('Title'), key: 'title' },
      { title: t('Applicant'), key: 'applicant' },
    ],
  },
  {
    title: t('Approved'),
    state: 'approved',
    icon: 'mdi-check-circle-outline',
    headers: [
      { title: t('Date'), key: 'creation_date' },
      { title: t('Type'), key: 'type' },
      { title: t('Title'), key: 'title' },
      { title: t('Applicant'), key: 'applicant' },
    ],
  },
])
</script>
