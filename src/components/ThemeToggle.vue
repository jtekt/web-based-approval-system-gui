<template>
  <v-btn
    :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();

const isDark = computed(() => theme.global.current.value.dark);

function toggle() {
  const next = isDark.value ? "light" : "dark";
  theme.change(next);
  localStorage.setItem("theme", next);
}
</script>
