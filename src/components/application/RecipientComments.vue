<template>
  <v-card flat>
    <v-card-title>{{ $t('Recipient comments') }}</v-card-title>
    <RecipientComment
      v-for="(recipient, index) in orderedRecipients"
      :key="`comment_${index}`"
      :recipient="recipient"
      @comment_updated="$emit('comment_updated')"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Application } from '@/types'
import RecipientComment from './RecipientComment.vue'

const props = defineProps<{ application: Application }>()
defineEmits<{ comment_updated: [] }>()

const orderedRecipients = computed(() =>
  props.application.recipients
    .slice()
    .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
)
</script>
