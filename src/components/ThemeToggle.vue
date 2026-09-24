<template>
  <v-btn
    :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    @click="theme.toggle()"
  />
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

// Saving the choice is handled in plugins/vuetify.ts
const theme = useTheme()
</script>
