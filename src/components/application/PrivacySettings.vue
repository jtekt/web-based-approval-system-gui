<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { Application, Group } from '@/types'
import GroupChip from '@/components/GroupChip.vue'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{ modelValue: Application }>()
const emit = defineEmits<{ 'update:modelValue': [value: Application] }>()

const route = useRoute()
const { currentUser } = useAuth()

const application = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const applicationId = () => route.params.application_id as string

async function updatePrivacy() {
  try {
    await api.put(`/applications/${applicationId()}/privacy`, {
      private: application.value.private,
    })
    emit('update:modelValue', application.value)
  } catch (error) {
    alert('Error updating privacy of application')
    console.error(error)
  }
}

function shareWithGroup(group: Group) {
  const url = `/applications/${applicationId()}/privacy/groups`
  const body = { group_id: group._id }

  api
    .post(url, body)
    .then(() => {
      if (!application.value.visibility) {
        application.value.visibility = []
      }

      // ✅ prevent duplicates by _id
      const exists = application.value.visibility.some(
        (g) => g._id === group._id
      )
      if (!exists) {
        application.value.visibility.push(group)
      }

      emit('update:modelValue', application.value)
    })
    .catch((error) => {
      alert('Error updating visibility of application')
      console.error(error)
    })
}

function removeVisibilityGroup(group: Group) {
  const url = `/applications/${applicationId()}/privacy/groups/${group._id}`

  axios
    .delete(url)
    .then(() => {
      if (!application.value.visibility) return

      // ✅ compare by _id only
      application.value.visibility = application.value.visibility.filter(
        (g) => g._id !== group._id
      )

      emit('update:modelValue', application.value)
    })
    .catch((error) => {
      console.error(error)
      alert('Error updating visibility of application')
    })
}
</script>
