<template>
  <v-select
    prepend-inner-icon="mdi-translate"
    :items="locales"
    item-title="text"
    item-value="value"
    v-model="locale"
    @update:model-value="saveLocale"
    hide-details
    variant="outlined"
    density="compact"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";

const { locale } = useI18n();

const locales = [
  { text: "English", value: "en" },
  { text: "日本語", value: "ja" },
];

function saveLocale() {
  localStorage.locale = locale.value;
}

onMounted(() => {
  if (localStorage.locale) locale.value = localStorage.locale;
});
</script>
