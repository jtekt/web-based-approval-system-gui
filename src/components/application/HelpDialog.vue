<template>
  <v-dialog v-model="dialog" width="800">
    <template #activator="{ props }">
      <v-btn variant="text" v-bind="props">
        <v-icon start>mdi-information</v-icon>
        <span>{{ t('help.button') }}</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h4">
        {{ t('help.title') }}
      </v-card-title>

      <v-card-subtitle class="mt-4 text-h6">
        {{ t('help.features.title') }}
      </v-card-subtitle>
      <v-card-text>
        {{ t('help.features.description') }}
      </v-card-text>

      <v-card-subtitle class="mt-4 text-h6">
        {{ t('help.steps.title') }}
      </v-card-subtitle>
      <v-card-text>
        <v-list density="compact">
          <v-list-item>{{ t('help.steps.step1') }}</v-list-item>
          <v-list-item>{{ t('help.steps.step2') }}</v-list-item>
          <v-list-item>{{ t('help.steps.step3') }}</v-list-item>
          <v-list-item>{{ t('help.steps.step4') }}</v-list-item>
        </v-list>
      </v-card-text>

      <v-card-subtitle class="mt-4 text-h6">
        {{ t('help.download.title') }}
      </v-card-subtitle>
      <v-card-text>
        {{ t('help.download.description') }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="primary" @click="dialog = false">
          {{ t('Close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const dialog = ref(false)
const { t } = useI18n()
</script>