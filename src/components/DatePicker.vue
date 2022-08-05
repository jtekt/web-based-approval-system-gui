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
        />

    </template>

    <v-date-picker
      v-model="date"
      no-title
      scrollable
      v-on:input="date_selected()">
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
    label: String
  },

  data: () => ({
    date: null,
    menu: false,
  }),


  methods: {
    save (date) {
      this.$refs.menu.save(date)
    },
    date_selected(){
      this.$refs.menu.save(this.date)
      this.$emit('input', this.date)
    }
  }


}
</script>
