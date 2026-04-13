<template>
  <v-dialog v-model="dialog" width="500">
    <template #activator="{ props }">
      <v-btn color="black" v-bind="props">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        <span>{{ $t('Add') }}</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>{{ $t('Add a group') }}</v-card-title>
      <v-card-text>
        <GroupPicker
          class="group-picker"
          :groupManagerApiUrl="GROUP_MANAGER_API_URL"
          :group-manager-front-url="VITE_EMPLOYEE_MANAGER_FRONT_URL"
          :accessToken="get_token()"
          @selection="onSelection"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="primary" @click="dialog = false">
          {{ $t('Close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import Cookies from 'js-cookie'
import { ref } from 'vue'
import {
  GroupPicker,
  type GroupItem,
} from '@moreillon/group-manager-vue-picker'
import { env } from '@/utils/env'

const GROUP_MANAGER_API_URL = env.VITE_GROUP_MANAGER_API_URL
const VITE_EMPLOYEE_MANAGER_FRONT_URL = env.VITE_EMPLOYEE_MANAGER_FRONT_URL

const emit = defineEmits<{ selection: [group: GroupItem] }>()

const dialog = ref(false)

function get_token() {
  return (
    Cookies.get('jwt') || Cookies.get('token') || localStorage.getItem('jwt')
  )
}

function onSelection(group: GroupItem) {
  emit('selection', group)
}
</script>
