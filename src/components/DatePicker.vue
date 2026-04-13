<template>
  <v-text-field
    v-model="date"
    :label="label"
    prepend-icon="mdi-calendar"
    readonly
    clearable
    @click="menu = true"
  >
    <v-menu v-model="menu" activator="parent" :close-on-content-click="false">
      <v-date-picker
        :model-value="pickerValue"
        @update:model-value="dateSelected"
        hide-header
      />
    </v-menu>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue?: string | null
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const menu = ref(false)

const date = computed({
  get: () => props.modelValue ?? null,
  set: (v) => emit('update:modelValue', v),
})

const pickerValue = computed(() =>
  props.modelValue ? new Date(props.modelValue) : null
)

function dateSelected(d: Date | null) {
  if (!d) {
    date.value = null
  } else {
    const iso = d.toISOString().split('T')[0]
    date.value = iso
  }
  menu.value = false
}
</script>
