<template>
  <v-expansion-panels v-if="selectedForm && !copyOf" variant="accordion" flat>
    <v-expansion-panel>
      <v-expansion-panel-title>
        {{ $t('Type') }}: {{ selectedForm.label }} ({{
          $t('Click for more info')
        }})
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row align="center">
          <v-col cols="auto">{{ $t('Template author') }}</v-col>
          <v-col
            v-for="(manager, index) in selectedForm.managers"
            :key="`manager_${index}`"
            cols="auto"
          >
            <UserChip :user="manager" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="form_description">{{
            selectedForm.description
          }}</v-col>
        </v-row>
        <v-row>
          <v-col cols="auto">
            <router-link
              :to="{
                name: 'template',
                params: { template_id: selectedForm._id },
              }"
            >
              {{ $t('Template page') }}
            </router-link>
          </v-col>
        </v-row>
        <v-divider class="mt-4" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import type { Template } from '@/types'
import UserChip from '@/components/UserChip.vue'

defineProps<{ selectedForm: Template }>()

const route = useRoute()
const copyOf = computed(() => route.query.copy_of)
</script>

<style scoped>
.form_description {
  white-space: pre-line;
}
</style>
