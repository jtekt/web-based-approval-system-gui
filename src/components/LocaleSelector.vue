<template>
  <v-select
    density="comfortable"
    prepend-icon="mdi-translate"
    :items="locales"
    item-title="text"
    item-value="value"
    v-model="$i18n.locale"
    @update:model-value="saveLocale"
    :hide-details="true"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const locales = [
  { text: 'English', value: 'en' },
  { text: '日本語', value: 'ja' },
]

function saveLocale() {
  localStorage.setItem('locale', locale.value)
}
</script>
