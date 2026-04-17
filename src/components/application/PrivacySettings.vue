<template>
  <v-list-item>
    <v-row>
      <v-col cols="4" class="d-flex align-center text-medium-emphasis">{{
        $t('Confidential')
      }}</v-col>
      <v-col cols="8">
        <v-switch
          :disabled="!isUserInFlow || loading"
          v-model="localPrivate"
          @change="updatePrivacy"
          hide-details
        />
      </v-col>
    </v-row>
  </v-list-item>
  <template v-if="application.private">
    <v-divider />
    <v-list-item>
      <v-row>
        <v-col cols="4" class="d-flex align-center text-medium-emphasis">
          {{ $t('Visibility') }}
        </v-col>
        <v-col cols="8" class="d-flex flex-column align-start ga-2">
          <v-chip label>
            {{ $t('Approval flow') }}
          </v-chip>

          <GroupChip
            v-for="group in application.visibility"
            :key="group._id"
            :group="group"
            :closable="isUserInFlow"
            @click:close="removeVisibilityGroup(group)"
          />

          <AddGroupDialog v-if="isUserInFlow" @selection="shareWithGroup" />
        </v-col>
      </v-row>
    </v-list-item>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Application, Group } from '@/types'
import GroupChip from '@/components/GroupChip.vue'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ modelValue: Application }>()
const emit = defineEmits<{ 'update:modelValue': [value: Application] }>()

const { t } = useI18n()
const { currentUser } = useAuth()
const toast = useToast()

const loading = ref(false)

const application = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const localPrivate = ref(application.value.private)

const isUserInFlow = computed(
  () =>
    application.value.applicant._id === currentUser.value?._id ||
    application.value.recipients.some((r) => r._id === currentUser.value?._id)
)

async function updatePrivacy() {
  const previous = application.value.private
  application.value.private = localPrivate.value
  loading.value = true

  try {
    await api.put(`/applications/${application.value._id}/privacy`, {
      private: application.value.private,
    })

    emit('update:modelValue', { ...application.value })
  } catch (error) {
    // rollback
    application.value.private = previous
    localPrivate.value = previous

    toast.error(t('Failed to update application privacy'))
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function shareWithGroup(group: Group) {
  const url = `/applications/${application.value._id}/privacy/groups`

  try {
    await api.post(url, { group_id: group._id })

    const visibility = application.value.visibility ?? []

    if (!visibility.some((g) => g._id === group._id)) {
      visibility.push(group)
    }

    application.value.visibility = visibility
    emit('update:modelValue', { ...application.value })
  } catch (error) {
    toast.error(t('Failed to share with group'))
    console.error(error)
  }
}

async function removeVisibilityGroup(group: Group) {
  const url = `/applications/${application.value._id}/privacy/groups/${group._id}`

  try {
    await api.delete(url)

    application.value.visibility =
      application.value.visibility?.filter((g) => g._id !== group._id) ?? []

    emit('update:modelValue', { ...application.value })
  } catch (error) {
    toast.error(t('Failed to remove group visibility'))
    console.error(error)
  }
}
</script>
