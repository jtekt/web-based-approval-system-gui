<template>
  <v-card>

    <v-toolbar flat>
      <v-btn
        exact
        icon
        :to="{name: 'templates'}" >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>
        Template
      </v-toolbar-title>
      <v-spacer/>
      <v-btn
        color="#c00000"
        dark
        text
        @click="delete_template()">
        <v-icon>mdi-delete</v-icon>
        <span>Delete</span>
      </v-btn>
      <v-btn
        text>
        <v-icon>mdi-content-save</v-icon>
        <span>Save</span>
      </v-btn>

    </v-toolbar>
    <v-divider/>

    <v-card-text v-if="template">

      <v-text-field
        label="template name"
        v-model="template.properties.label" />

      <v-card outlined>

        <v-toolbar flat>
          <v-toolbar-title>
            Fields
          </v-toolbar-title>
          <v-spacer/>
          <v-btn
            dark
            @click="add_field()">
            <v-icon>mdi-plus</v-icon>
            <span>Add field</span>
          </v-btn>
        </v-toolbar>
        <v-divider/>
        <v-card-text>

          <v-row
            v-for="(field, index) in template.properties.fields"
            :key="`field_${index}`">
            <v-col>
              <v-text-field
                label="Field name"
                v-model="field.label" />
            </v-col>
            <v-col>
              <v-select
                :items="field_types"
                item-text="label"
                item-value="type"
                v-model="field.type"
                label="Type"/>
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="#c00000"
                dark
                @click="delete_field(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>

        </v-card-text>

      </v-card>

    </v-card-text>


  </v-card>
</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'


export default {
  name: 'Template',
  components: {

  },
  mixins: [
    IdUtils
  ],
  data(){
    return {
      template: null,
      field_types: [
        { type: 'text', label: 'テキスト / Text' },
        { type: 'file', label: 'ファイル / File' },
        { type: 'pdf', label: 'PDF (承認)' },
        { type: 'checkbox', label: 'チェックボックス / Checkbox' },
        { type: 'date', label: '日付 / Date' },
        { type: 'link', label: 'リンク / Link' },
        { type: 'application', label: '申請番号 / Application no' },
        //{ type: 'file_path', label: 'ファイルパス / File path' },
      ],

    }
  },
  mounted () {
    this.get_template()
  },
  methods: {

    get_template () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.get(url)
      .then(({ data }) => { this.template = data })
      .catch(error => console.log(error))
    },

    update_template () {

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      const group_ids = this.template.groups.map( group => this.get_id_of_item(group))
      const {fields, label, description} = this.template.properties

      const body = {
        fields,
        label,
        description,
        group_ids,
      }

      this.axios.put(url, body)
      .then(() => { this.$router.push({ name: 'application_templates' }) })
      .catch(error => {
        alert('Error while updating the template')
        console.log(error)
      })
    },
    delete_template(){
      if(!confirm(`Delete template ${this.template_id}?`)) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.delete(url)
      .then( () => {
        this.$router.push({name: 'templates'})
      })
      .catch( error => {
        console.error(error)
        if(error.response) this.error_message = error.response.data
      })
    },
    add_field () {
      this.template.properties.fields.push({ type: 'text', label: '' })
    },
    delete_field (index) {
      if (!confirm('ホンマ？')) return
      this.template.properties.fields.splice(index, 1)
    },
  },
  computed: {
    template_id(){
      return this.$route.params.template_id
    }
  }
}
</script>
