<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar color="black" flat>
      <v-app-bar-nav-icon
        v-if="isAuthenticated && isMobile"
        @click="drawer = !drawer"
      />

      <v-app-bar-title>申請マネージャー</v-app-bar-title>

      <template #append>
        <div class="d-flex align-center">
          <v-btn icon @click="toggleTheme">
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>

          <LocaleSelector />

          <v-btn v-show="isAuthenticated" icon @click="handelLogout">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <!-- Drawer -->
    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      :permanent="isAuthenticated && !isMobile"
      :temporary="isAuthenticated && isMobile"
    >
      <v-list nav density="compact">
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

    <v-snackbar-queue v-model="toasts.queue.value" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisplay, useTheme } from 'vuetify'
import LocaleSelector from '@/components/LocaleSelector.vue'
import { useToast } from './composables/useToast'
import { useAuth } from './composables/useAuth'
import api from './api'
import { env } from './utils/env'

const toasts = useToast()
const { currentUser, logout } = useAuth()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const theme = useTheme()
const display = useDisplay()

const isAuthenticated = computed(() => !!currentUser.value)
const isMobile = computed(() => display.mdAndDown.value)

const drawer = ref(false)

/**
 * Keep drawer in sync with auth + screen size
 */
watch(
  [isAuthenticated, isMobile],
  ([auth, mobile]) => {
    if (!auth) {
      drawer.value = false
    } else {
      drawer.value = !mobile // open on desktop, closed on mobile
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
  ...(env.VITE_PDF_MODE
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

function handelLogout() {
  logout()
  router.push({ name: 'login' })
}

function toggleTheme() {
  theme.toggle()
  localStorage.setItem('theme', theme.current.value.dark ? 'dark' : 'light')
}

onMounted(async () => {
  await router.isReady()

  if (route.meta?.public || !isAuthenticated.value) return

  try {
    const params: Record<string, string> = {
      relationship: 'SUBMITTED_TO',
      state: 'pending',
    }

    if (env.VITE_PDF_MODE) {
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
})
</script>
