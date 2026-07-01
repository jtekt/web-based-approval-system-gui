<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar color="black">
      <v-app-bar-nav-icon v-if="!route.meta.public" @click="drawer = !drawer" />

      <v-app-bar-title>{{ env.VITE_APP_TITLE }}</v-app-bar-title>

      <template #append>
        <LocaleSelector />

        <ThemeToggle />

        <v-btn v-if="env.VITE_APPS_URL" :href="env.VITE_APPS_URL" icon="mdi-apps" />

        <v-btn
          v-if="!route.meta.public"
          icon="mdi-logout"
          @click="handleLogout"
        />
      </template>
    </v-app-bar>

    <!-- Drawer -->
    <v-navigation-drawer v-if="!route.meta.public" v-model="drawer">
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
        >
          <template v-if="item.badge" #append>
            <v-badge :content="item.badge" color="primary" inline />
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleSelector from '@/components/LocaleSelector.vue'
import api from './api'
import ThemeToggle from './components/ThemeToggle.vue'
import { useAuth } from '@jtekt/vuetify-auth'
import { env } from './utils/env.ts'

const { session, logout, isLoading } = useAuth()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const drawer = ref(false)

/**
 * Keep drawer in sync with auth + screen size
 */
watch(
  [session, isLoading],
  ([auth, loading]) => {
    if (loading) return

    if (auth?.accessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${auth.accessToken}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  },
  { immediate: true }
)

const receivedApplications = ref(0)

const navItems = computed(() => [
  {
    name: 'new_application',
    title: t('New application'),
    to: { name: 'new_application' },
    icon: 'mdi-plus',
  },
  {
    name: 'submitted_applications',
    title: t('Outbox'),
    to: { name: 'submitted_applications' },
    icon: 'mdi-inbox-arrow-up',
  },
  {
    name: 'received_applications',
    title: t('Inbox'),
    to: { name: 'received_applications' },
    icon: 'mdi-inbox-arrow-down',
    badge:
      receivedApplications.value > 0 ? receivedApplications.value : undefined,
  },
  {
    name: 'search',
    title: t('Search'),
    to: { name: 'search' },
    icon: 'mdi-magnify',
  },
  ...(env.VITE_PDF_ONLY
    ? []
    : [
        {
          name: 'templates',
          title: t('Templates'),
          to: { name: 'templates' },
          icon: 'mdi-file-document-multiple-outline',
        },
      ]),
  {
    name: 'about',
    title: t('About'),
    to: { name: 'about' },
    icon: 'mdi-information-outline',
  },
])

function handleLogout() {
  logout()
}

async function fetchReceivedApplications() {
  try {
    const params: Record<string, string> = {
      relationship: 'SUBMITTED_TO',
      state: 'pending',
    }

    if (env.VITE_PDF_ONLY) {
      params.type = 'PDF'
    }

    const { data } = await api.get<{ count: number }>('/applications', {
      params,
    })

    receivedApplications.value = data.count
  } catch (err: unknown) {
    const error = err as { response?: { status: number } }
    if (error.response?.status === 401) {
      router.push({ name: 'login' })
    }
  }
}

watch([session, route], ([session, routeMeta]) => {
  const isPublic = routeMeta.meta?.public
  if (!session || isPublic) {
    receivedApplications.value = 0
    return
  }

  fetchReceivedApplications()
})
</script>
