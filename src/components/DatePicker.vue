<template>

  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :return-value.sync="date"
    transition="scale-transition"
    offset-y
    min-width="auto" >

    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="date"
        :label="label"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="attrs"
        v-on="on"
        clearable/>
    </template>

    <v-date-picker
      v-model="date"
      no-title
      scrollable
      v-on:input="date_selected($event)">
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="menu = false" >
        Cancel
      </v-btn>
    </v-date-picker>

  </v-menu>
</template>

<script>

export default {
  name: 'DatePicker',
  props: {
    label: String,
    value: String,
  },

  data: () => ({
    menu: false,
  }),


  methods: {
    date_selected(event) {
      this.$refs.menu.save(event)
    }

  },
  computed: {
    date: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
  }


}
</script>
