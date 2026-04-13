<template>
  <v-card-text>
    <v-row v-for="(field, index) in formFields" :key="`field_${index}`">
      <v-col>
        <FileUpload
          v-if="field.type === 'file' || field.type === 'pdf'"
          :label="field.label"
          :model-value="field.value as string | null"
          :accept="field.type === 'pdf' ? 'application/pdf' : ''"
          @update:model-value="field.value = $event"
        />
        <v-checkbox
          v-else-if="field.type === 'checkbox'"
          v-model="field.value"
          :label="field.label"
        />
        <DatePicker
          v-else-if="field.type === 'date'"
          :label="field.label"
          :model-value="field.value as string | null"
          @update:model-value="field.value = $event"
        />
        <v-textarea
          v-else-if="field.type === 'text'"
          rows="1"
          auto-grow
          :label="field.label"
          v-model="field.value"
        />
        <v-text-field v-else v-model="field.value" :label="field.label" />
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Field } from '@/types'
import DatePicker from '@/components/DatePicker.vue'
import FileUpload from './FileUpload.vue'

const props = defineProps<{ modelValue: Field[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: Field[]] }>()

const formFields = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>
