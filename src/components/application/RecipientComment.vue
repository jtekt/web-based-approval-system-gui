<template>
  <v-list-item v-if="decision" lines="two">
    <!-- TITLE -->
    <template #title>
      <!-- EDIT MODE -->
      <v-textarea
        v-if="editing"
        ref="commentTextArea"
        v-model="newComment"
        variant="outlined"
        auto-grow
        density="compact"
        :rows="1"
        hide-details
        @keydown.enter.prevent="updateComment"
        @keydown.esc="disableEditing"
      />

      <!-- VIEW MODE -->
      <div v-else class="text-body-2" :class="{ 'text-disabled': !hasComment }">
        {{ hasComment ? recipientComment : t('No comment') }}
      </div>
    </template>

    <!-- SUBTITLE -->
    <template #subtitle>
      {{ recipient.display_name ?? '' }}
    </template>

    <!-- ACTIONS -->
    <template #append>
      <template v-if="editing">
        <v-btn icon @click="disableEditing">
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-btn
          icon
          :loading="loading"
          :disabled="!isDirty"
          @click="updateComment"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </template>

      <v-btn
        v-else-if="recipientIsUser"
        icon
        variant="text"
        @click="enableEditing"
      >
        <v-icon size="small">mdi-pencil</v-icon>
      </v-btn>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import type { Recipient } from '@/types'

const props = defineProps<{ recipient: Recipient }>()
const emit = defineEmits<{ comment_updated: [] }>()

const { t } = useI18n()
const route = useRoute()
const { currentUser } = useAuth()
const toast = useToast()

const editing = ref(false)
const loading = ref(false)
const newComment = ref('')
const commentTextArea = ref<HTMLTextAreaElement | null>(null)

const applicationId = computed(() => route.params.application_id as string)

const decision = computed(
  () => props.recipient.approval ?? props.recipient.refusal
)

const recipientIsUser = computed(() => {
  return !!currentUser.value && props.recipient._id === currentUser.value._id
})

const recipientComment = computed(() => {
  return decision.value?.comment ?? ''
})

const hasComment = computed(() => recipientComment.value.trim().length > 0)

const isDirty = computed(() => newComment.value !== recipientComment.value)

function enableEditing() {
  if (!recipientIsUser.value) return

  newComment.value = recipientComment.value
  editing.value = true

  nextTick(() => {
    commentTextArea.value?.focus()
  })
}

function disableEditing() {
  editing.value = false
  newComment.value = recipientComment.value
}

async function updateComment() {
  if (!recipientIsUser.value || !isDirty.value) return

  loading.value = true
  try {
    const url = `/applications/${applicationId.value}/comment`

    await api.put(url, {
      comment: newComment.value.trim() || null, // ✅ send null, not "No comment"
    })

    editing.value = false
    emit('comment_updated')
  } catch (error) {
    toast.error(t('Edit failed'))
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
