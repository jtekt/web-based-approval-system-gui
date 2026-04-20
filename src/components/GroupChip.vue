<template>
  <v-chip label outlined :close="close" @click:close="$emit('click:close')">
    <v-avatar start class="mr-2">
      <v-img :src="group.avatar_src" v-if="group.avatar_src" />
      <v-icon v-else>mdi-account-multiple</v-icon>
    </v-avatar>
    <span>{{ group.name }}</span>
  </v-chip>
</template>

<script>
export default {
  name: "GroupChip",
  props: {
    group: Object,
    close: Boolean,
  },
  computed: {},
}
</script>
