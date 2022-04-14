<template>
  <v-card
    max-width="500"
    class="mx-auto">
    <v-toolbar flat>
      <v-btn
        exact
        icon
        :to="{name: 'templates'}" >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>New template</v-toolbar-title>



    </v-toolbar>
    <v-divider/>

    <v-card-text>
      <v-form
        @submit.prevent="create_template()"
        ref="form"
        v-model="valid"
        lazy-validation>

        <v-row align="center">
          <v-col>
            <v-text-field
            v-model="template.label"
            label="Name"
            :rules="nameRules"
            required/>
          </v-col>
          <v-col cols="auto">
            <v-btn
              type="submit"
              :disabled="!valid" >
              <v-icon>mdi--plus</v-icon>
              <span>Create</span>
            </v-btn>
          </v-col>
        </v-row>

      </v-form>
    </v-card-text>



  </v-card>
</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'NewTemplate',
  mixins: [
    IdUtils
  ],
  data(){
    return {
      error_message: null,
      template: {
        label: '',
      },
      valid: false,
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 100 || 'Name must be less than 100 characters',
      ],
    }
  },

  methods: {
    create_template(){
      if(!this.$refs.form.validate()) return
      this.error_message = null

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates`
      this.axios.post(url, this.template)
      .then( ({data}) => {
        const template_id = this.get_id_of_item(data)
        this.$router.push({name: 'template', params: {template_id}})
      })
      .catch( error => {
        console.error(error)
        if(error.response) this.error_message = error.response.data
      })
    }
  }
}
</script>

<style>

</style>
