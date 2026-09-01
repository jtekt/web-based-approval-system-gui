<template>
  <v-chip :href="link ? userProfileUrl : undefined" target="_blank">
    <v-avatar start class="mr-2">
      <v-img :src="user.avatar_src" v-if="user.avatar_src" />
      <v-icon v-else>mdi-account</v-icon>
    </v-avatar>
    <span>{{ name }}</span>
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types'
import { env } from '@/utils/env'

const props = withDefaults(
  defineProps<{
    user: User
    link?: boolean
  }>(),
  { link: true }
)

const name = computed(
  () => props.user.display_name ?? props.user.username ?? ''
)

const userProfileUrl = computed(() => {
  const base = env.VITE_EMPLOYEE_MANAGER_FRONT_URL
  if (!base) return undefined
  return `${base}/users/${props.user._id}`
})
</script>
