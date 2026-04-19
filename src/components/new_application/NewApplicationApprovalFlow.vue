<template>
  <draggable class="approval_flow" :list="recipients" item-key="_id">
    <template #item="{ element, index }">
      <div class="flow_item">
        <v-icon class="mx-2" v-if="index > 0">mdi-arrow-right</v-icon>
        <v-chip closable label @click:close="deleteRecipient(index)">
          {{ recipientName(element) }}
        </v-chip>
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import type { User } from '@/types'

const props = defineProps<{ recipients: User[] }>()

function recipientName(user: User): string {
  const u = user
  return u.display_name ?? u.name_kanji ?? u.full_name ?? u.username ?? ''
}

function deleteRecipient(index: number) {
  props.recipients.splice(index, 1)
}
</script>

<style scoped>
.approval_flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.flow_item {
  display: flex;
  align-items: center;
  margin: 1em 0;
}
</style>
