<template>
  <div class="web_hanko" v-html="svg" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipient } from '@/types'
import { generateWebHankoSvg } from '@/utils/webHankos'

const props = defineProps<{ recipient: Recipient }>()

const svg = computed(() => generateWebHankoSvg(props.recipient))
</script>

<style>
.web_hanko {
  position: relative;
  height: 100%;
  width: 100%;
}

.web_hanko > svg {
  height: 100%;
  width: 100%;
}
</style>
