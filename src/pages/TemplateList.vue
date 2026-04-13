<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('Templates') }}</v-toolbar-title>
      <v-spacer />
      <v-btn color="primary" :to="{ name: 'new_template' }">
        <v-icon start>mdi-plus</v-icon>
        <span>{{ $t('Create template') }}</span>
      </v-btn>
      <template #extension>
        <v-tabs v-model="tab" align-tabs="title">
          <v-tab value="mine">{{ $t('My templates') }}</v-tab>
          <v-tab value="shared">{{ $t('Templates shared with me') }}</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-divider />

    <v-window v-model="tab">
      <v-window-item value="mine">
        <v-card-text>
          <v-data-table
            :items-per-page="-1"
            :headers="headers"
            :items="myTemplates"
            @click:row="viewTemplate"
            :loading="loading"
          >
            <template #item.groups="{ item }">
              <GroupChip
                v-for="(group, index) in item.groups"
                :key="`${item._id}_group_${index}`"
                :group="group"
                class="mr-2"
              />
            </template>
            <template #item.managers="{ item }">
              <div class="managers_wrapper">
                <UserChip
                  v-for="(manager, index) in item.managers"
                  :key="`${item._id}_manager_${index}`"
                  :user="manager"
                  :link="false"
                />
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-window-item>

      <v-window-item value="shared">
        <v-card-text>
          <v-data-table
            :items-per-page="-1"
            :headers="headers"
            :items="sharedTemplates"
            @click:row="viewTemplate"
            :loading="loading"
          >
            <template #item.managers="{ item }">
              <div class="managers_wrapper">
                <UserChip
                  v-for="(manager, index) in item.managers"
                  :key="`${item._id}_manager_${index}`"
                  :user="manager"
                  :link="false"
                />
              </div>
            </template>
            <template #item.groups="{ item }">
              <GroupChip
                v-for="(group, index) in item.groups"
                :key="`${item._id}_group_${index}`"
                :group="group"
                class="mr-2"
              />
            </template>
          </v-data-table>
        </v-card-text>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Template } from '@/types'
import UserChip from '@/components/UserChip.vue'
import GroupChip from '@/components/GroupChip.vue'
import { useAuth } from '@/composables/useAuth'
import api from '@/api'

const { t } = useI18n()
const router = useRouter()
const { currentUser } = useAuth()

const tab = ref('mine')
const templates = ref<Template[]>([])
const loading = ref(false)

const headers = computed(() => [
  { title: t('Name'), key: 'label' },
  { title: t('Groups'), key: 'groups' },
  { title: t('Managers'), key: 'managers' },
])

const myTemplates = computed(() =>
  templates.value.filter((tmpl) =>
    tmpl.managers.some((m) => m._id === currentUser.value?._id)
  )
)

const sharedTemplates = computed(() =>
  templates.value.filter(
    (tmpl) => !tmpl.managers.some((m) => m._id === currentUser.value?._id)
  )
)

onMounted(() => getTemplates())

function getTemplates() {
  loading.value = true
  api
    .get<Template[]>('/templates')
    .then(({ data }) => {
      templates.value = data
    })
    .catch((err) => console.error(err))
    .finally(() => {
      loading.value = false
    })
}

function viewTemplate(_event: Event, row: { item: Template }) {
  router.push({ name: 'template', params: { template_id: row.item._id } })
}
</script>

<style scoped>
.managers_wrapper {
  display: flex;
  gap: 0.5em;
}
</style>
