<template>
  <v-dialog v-model="dialog" max-width="60rem">
    <template #activator="{ props }">
      <v-btn color="black" v-bind="props">
        <v-icon start>mdi-account-plus</v-icon>
        <span>{{ $t('Add') }}</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>{{ $t('Add a manager') }}</v-card-title>
      <v-card-text>
        <UserSearchPicker @selection="userSelected" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="primary" @click="dialog = false">{{
          $t('Close')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { User } from '@/types'
import UserSearchPicker from '@/components/UserSearchPicker.vue'
import api from '@/api'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ selection: [user: User] }>()

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const dialog = ref(false)
const loading = ref(false)

async function userSelected(user: User) {
  const displayName = user.display_name ?? user.username ?? ''
  if (!confirm(t('Make manager confirmation', { name: displayName }))) return
  loading.value = true
  try {
    const templateId = route.params.template_id
    await api.post(`/templates/${templateId}/managers`, {
      user_id: user._id,
    })
    emit('selection', user)
    dialog.value = false
  } catch (error) {
    toast.error(t('Failed to add manager'))
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
