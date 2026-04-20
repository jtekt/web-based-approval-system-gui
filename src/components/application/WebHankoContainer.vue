<template>
  <div class="web_hanko_container">
    <a :href="userProfileUrl" target="_blank" class="hanko_container_header">
      {{ recipientDisplayedName }}
    </a>

    <div class="hanko_area">
      <WebHanko v-if="recipient.approval" :recipient="recipient" />
      <v-icon color="#c00000" size="x-large" v-else-if="recipient.refusal"
        >mdi-close-circle</v-icon
      >
      <EmailButton
        v-else-if="showEmailButton"
        :application="application"
        :user="recipient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipient, Application } from '@/types'
import WebHanko from '@/components/WebHanko.vue'
import EmailButton from './EmailButton.vue'
import { env } from '@/utils/env'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  recipient: Recipient
  application: Application
}>()

const { currentUser } = useAuth()

/* -----------------------------
 * Current recipient (first pending)
 * ----------------------------- */
const currentRecipient = computed(() => {
  return (
    props.application.recipients.find((r) => !r.approval && !r.refusal) ?? null
  )
})

/* -----------------------------
 * User roles
 * ----------------------------- */
const userAsRecipient = computed(() => {
  if (!currentUser.value) return null
  return (
    props.application.recipients.find(
      (r) => r._id === currentUser.value?._id
    ) ?? null
  )
})

const userIsApplicant = computed(() => {
  return props.application.applicant?._id === currentUser.value?._id
})

/* -----------------------------
 * Logic (compare by _id)
 * ----------------------------- */
const recipientIsCurrentRecipient = computed(() => {
  if (!currentRecipient.value) return false
  return props.recipient._id === currentRecipient.value._id
})

const showEmailButton = computed(() => {
  return (
    recipientIsCurrentRecipient.value &&
    (userIsApplicant.value || !!userAsRecipient.value)
  )
})

/* -----------------------------
 * UI helpers
 * ----------------------------- */
const userProfileUrl = computed(() => {
  const base = env.VITE_EMPLOYEE_MANAGER_FRONT_URL
  if (!base) return '#'
  return `${base}/users/${props.recipient._id}`
})

const recipientDisplayedName = computed(() => {
  const r = props.recipient
  if (r.display_name && r.display_name.length <= 6) return r.display_name
  return r.family_name ?? r.family_name_kanji ?? r.display_name ?? ''
})
</script>

<style scoped>
.web_hanko_container {
  width: 6rem;
  border: 1px solid #666666;
  border-radius: 5px;
  margin: 5px;
}

.web_hanko_container > * {
  padding: 5px;
}

.hanko_container_header {
  display: block;
  color: currentColor;
  text-decoration: none;
  text-align: center;
  font-size: 80%;
  margin: 0 5px;
  border-bottom: 1px solid #666666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color 0.25s;
}

.hanko_container_header:hover {
  color: #c00000;
}

.hanko_area {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
