<template>
  <div class="px-4">
    <v-switch
      :disabled="!isUserApplicant || loading"
      :label="$t('Confidential')"
      v-model="localPrivate"
      @change="updatePrivacy"
      hide-details
    />
  </div>
  <template v-if="application.private">
    <v-list-item>
      <v-list-item-title>
        {{ $t('Visibility') }}
      </v-list-item-title>

      <div class="align-end">
        <v-row>
          <v-col cols="auto">
            <v-chip outlined label>
              {{ $t('Approval flow') }}
            </v-chip>
          </v-col>

          <v-col
            cols="auto"
            v-for="group in application.visibility"
            :key="group._id"
          >
            <GroupChip
              :group="group"
              :closable="isUserApplicant"
              @click:close="removeVisibilityGroup(group)"
            />
          </v-col>

          <v-col cols="auto" v-if="isUserApplicant">
            <AddGroupDialog @selection="shareWithGroup" />
          </v-col>
        </v-row>
      </div>
    </v-list-item>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Application, Group } from '@/types'
import GroupChip from '@/components/GroupChip.vue'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ modelValue: Application }>()
const emit = defineEmits<{ 'update:modelValue': [value: Application] }>()

const { currentUser } = useAuth()
const toast = useToast()

const loading = ref(false)

const application = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const localPrivate = ref(application.value.private)

const isUserApplicant = computed(() =>
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

    toast.error('Failed to update application privacy')
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
    toast.error('Failed to share with group')
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
    toast.error('Failed to remove group visibility')
    console.error(error)
  }
}
</script>
