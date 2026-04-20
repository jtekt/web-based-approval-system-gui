<template>
  <div class="button_wrapper">
    <v-btn icon size="x-large" variant="flat" @click="emailButtonClicked">
      <div class="d-flex flex-column align-center">
        <v-icon v-if="submission?.notified">mdi-email-check</v-icon>
        <v-icon v-else>mdi-email</v-icon>
        <span class="user_name">
          {{ user.family_name ?? user.family_name_romaji ?? user.family_name_kanji ?? '' }}
        </span>
      </div>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Recipient, Application } from '@/types'
import {
  generateEmailToRecipient,
  generateEmailToApplicant,
} from '@/utils/emails'
import api from '@/api'

const props = defineProps<{
  user: Recipient
  application: Application
}>()

const route = useRoute()

const submission = props.user.submission

const applicationId = route.params.application_id

function emailButtonClicked() {
  if (submission) {
    sendEmailToRecipient(props.user)
  } else {
    sendEmailToApplicant()
  }
}

function sendEmailToRecipient(recipient: Recipient) {
  window.location.href = generateEmailToRecipient(props.application, recipient)
  markRecipientAsNotified(recipient)
}

function sendEmailToApplicant() {
  window.location.href = generateEmailToApplicant(props.application)
}

async function markRecipientAsNotified(recipient: Recipient) {
  try {
    const recipientId = recipient._id
    const url = `/applications/${applicationId}/recipients/${recipientId}/notifications`
    await api.post(url)
    if (recipient.submission) {
      recipient.submission.notified = true
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.user_name {
  max-width: 80px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
