<template>
  <v-btn-toggle
    v-if="env.VITE_PDF_TOGGLE"
    v-model="mode"
    mandatory
    color="primary"
    divided
    rounded="xl"
    class="d-flex align-center"
  >
    <v-btn size="40" value="ALL" icon="mdi-file-document-multiple-outline"></v-btn>
    <v-btn size="40" value="PDF" icon="mdi-file-pdf-box"></v-btn>
  </v-btn-toggle>
</template>

<script setup lang="ts">
import { useMode } from '@/composables/useMode'
import { env } from '@/utils/env'

const { mode } = useMode()
</script>
