<template>
  <v-chip
    label
    variant="outlined"
    :closable="closable"
    @click:close="$emit('click:close', group)"
  >
    <v-avatar start class="mr-2">
      <v-img :src="group.avatar_src" v-if="group.avatar_src" />
      <v-icon v-else>mdi-account-multiple</v-icon>
    </v-avatar>
    <span>{{ group.name }}</span>
  </v-chip>
</template>

<script setup lang="ts">
import type { Group } from '@/types'

const props = withDefaults(
  defineProps<{
    group: Group
    closable?: boolean
  }>(),
  { closable: false }
)

defineEmits<{
  (e: 'click:close', group: Group): void
}>()
</script>
