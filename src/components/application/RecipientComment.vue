<template>
  <v-card v-if="decision" variant="flat">
    <v-card-text>
      <v-row align="start" justify="space-between">
        <!-- LEFT SIDE -->
        <v-col>
          <!-- NAME -->
          <div class="text-body-large text-medium-emphasis">
            {{ recipient.display_name ?? '' }}
          </div>

          <!-- EDIT MODE -->
          <template v-if="editing">
            <v-textarea
              ref="commentTextArea"
              v-model="newComment"
              variant="outlined"
              auto-grow
              density="compact"
              :rows="2"
              hide-details
              @keydown.enter.ctrl.prevent="updateComment"
              @keydown.esc="disableEditing"
            />
          </template>

          <!-- VIEW MODE -->
          <template v-else>
            <div
              class="text-body-2"
              :class="{ 'text-disabled': !hasComment }"
              style="white-space: pre-wrap"
            >
              {{ hasComment ? recipientComment : t('No comment') }}
            </div>
          </template>
        </v-col>

        <!-- ACTIONS -->
        <v-col cols="auto">
          <v-row v-if="editing" gap="4">
            <v-btn
              icon="mdi-content-save"
              size="small"
              :loading="loading"
              :disabled="!isDirty"
              @click="updateComment"
            />
            <v-btn icon="mdi-close" size="small" @click="disableEditing" />
          </v-row>

          <template v-else>
            <v-btn
              v-if="recipientIsUser"
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="enableEditing"
            />
          </template>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
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
