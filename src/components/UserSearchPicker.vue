<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="search"
    :items="items"
    :loading="loading"
    item-title="display_name"
    item-value="_id"
    return-object
    :label="$t('Search users')"
    no-filter
    clearable
    @update:model-value="onSelect"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="displayName(item)" />
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/types'
import api from '@/api'

const emit = defineEmits<{ selection: [user: User] }>()

const selected = ref<User | null>(null)
const search = ref('')
const items = ref<User[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function displayName(item: User): string {
  return item.display_name ?? item.username ?? item.preferred_username ?? ''
}

watch(search, (val) => {
  if (!val || val.length < 2) {
    items.value = []
    return
  }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchUsers(val), 300)
})

async function fetchUsers(q: string) {
  loading.value = true
  try {
    const { data } = await api.get<User[]>('/users', {
      params: { search: q },
    })
    items.value = data
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function onSelect(user: User | null) {
  if (user) {
    emit('selection', user)
    selected.value = null
    search.value = ''
    items.value = []
  }
}
</script>
