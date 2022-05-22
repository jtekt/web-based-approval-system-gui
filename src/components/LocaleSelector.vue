<template>
  <v-select
    prepend-icon="mdi-translate"
    :items="locales"
    v-model="$i18n.locale"
    @change="save_locale()"/>
</template>

<script>
export default {
  name: 'LocaleSelector',
  data(){
      return {
        locales: [
            {text: 'English', value: 'en'},
            {text: '日本語', value: 'ja'},
        ],
      }
  },
  mounted(){
      this.restore_locale()
  },
  methods: {
      save_locale(){
        localStorage.locale = this.$i18n.locale
      },
      restore_locale(){
        if(localStorage.locale)
        this.$i18n.locale = localStorage.locale
      }
  }
  
}
</script>


