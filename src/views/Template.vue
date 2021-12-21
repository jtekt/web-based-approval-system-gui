<template>
  <v-card>

    <v-toolbar flat>
      <v-btn
        exact
        icon
        :to="{name: 'templates'}" >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title v-if="template">{{template.properties.label}}</v-toolbar-title>
      <v-toolbar-title v-else>Template</v-toolbar-title>
      <v-spacer/>

      <template v-if="user_is_author">
        <v-btn
          color="#c00000"
          dark
          text
          @click="delete_template()">
          <v-icon>mdi-delete</v-icon>
          <span>Delete</span>
        </v-btn>
        <v-btn
          text
          @click="update_template()">
          <v-icon>mdi-content-save</v-icon>
          <span>Save</span>
        </v-btn>
      </template>

    </v-toolbar>
    <v-divider/>

    <v-card-text v-if="template">

      <v-text-field
        :readonly="!user_is_author"
        label="template name"
        v-model="template.properties.label" />

      <v-textarea
          label="Description"
          auto-grow
          rows="1"
          v-model="template.properties.description"
          hint="Hint text"/>

      <div class="">
        <v-chip>User</v-chip>
        <v-chip
          :close="user_is_author"
          v-for="(group, index) in template.groups"
          :key="`group_${index}`"
          @click:close="remove_group()">
          {{group.properties.name}}
        </v-chip>
        <AddGroupDialog v-if="user_is_author"/>
      </div>



      <v-card outlined>

        <v-toolbar flat>
          <v-toolbar-title>
            Fields
          </v-toolbar-title>
          <v-spacer/>
          <v-btn
            v-if="user_is_author"
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
                :readonly="!user_is_author"
                label="Field name"
                v-model="field.label" />
            </v-col>
            <v-col>
              <v-select
                :readonly="!user_is_author"
                :items="field_types"
                item-text="label"
                item-value="type"
                v-model="field.type"
                label="Type"/>
            </v-col>
            <v-col
              v-if="user_is_author"
              cols="auto">
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

import AddGroupDialog from '@/components/AddGroupDialog.vue'

export default {
  name: 'Template',
  components: {
    AddGroupDialog
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
      .then(() => { this.$router.push({ name: 'templates' }) })
      .catch(error => {
        alert('Error while updating the template')
        console.log(error)
      })
    },

    remove_group(){
      console.log('Not implemented')
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
    },
    user_is_author(){
      if(!this.template) return false
      const author_id = this.get_id_of_item(this.template.author)
      return author_id === this.current_user_id
    }
  }
}
</script>
