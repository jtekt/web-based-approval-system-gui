<template>
  <v-select
    v-model="locale"
    :items="locales"
    prepend-inner-icon="mdi-translate"
    variant="outlined"
    density="compact"
    max-width="150px"
    hide-details
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Saving the choice and updating <html lang> are handled in plugins/i18n.ts
const { locale } = useI18n({ useScope: 'global' })

const locales = [
  { title: 'English', value: 'en' },
  { title: '日本語', value: 'ja' },
]
</script>
