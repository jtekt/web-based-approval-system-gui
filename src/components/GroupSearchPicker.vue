<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="search"
    :items="items"
    :loading="loading"
    item-title="name"
    item-value="_id"
    return-object
    :label="$t('Search groups')"
    no-filter
    clearable
    @update:model-value="onSelect"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="item.name ?? ''" />
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Group } from '@/types'
import api from '@/api'

const emit = defineEmits<{ selection: [group: Group] }>()

const selected = ref<Group | null>(null)
const search = ref('')
const items = ref<Group[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(search, (val) => {
  if (!val || val.length < 2) {
    items.value = []
    return
  }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchGroups(val), 300)
})

async function fetchGroups(q: string) {
  loading.value = true
  try {
    const { data } = await api.get<Group[]>('/groups', {
      params: { search: q },
    })
    items.value = data
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function onSelect(group: Group | null) {
  if (group) {
    emit('selection', group)
    selected.value = null
    search.value = ''
    items.value = []
  }
}
</script>
