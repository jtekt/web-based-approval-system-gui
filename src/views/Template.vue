<template>
  <v-card
    :loading="loading">

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
          :loading="deleting"
          @click="delete_template()">
          <v-icon>mdi-delete</v-icon>
          <span>Delete</span>
        </v-btn>
        <v-btn
          text
          :loading="saving"
          @click="update_template()">
          <v-icon>mdi-content-save</v-icon>
          <span>Save</span>
        </v-btn>
      </template>

    </v-toolbar>
    <v-divider/>

    <template v-if="template">
      <v-card-text >

        <v-row>
          <v-col>
            <v-text-field
              :readonly="!user_is_author"
              label="template name"
              v-model="template.properties.label" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-textarea
              label="Description"
              auto-grow
              rows="1"
              v-model="template.properties.description"
              hint="Hint text"/>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col cols="auto"> Visibility</v-col>

          <v-col cols="auto">
            <v-chip>Current User</v-chip>
          </v-col>

          <v-col
            cols="auto"
            v-for="(group, index) in template.groups"
            :key="`group_${index}`">
            <v-chip
              :close="user_is_author"
              @click:close="remove_group(index)">
              {{group.name || group.properties.name}}
            </v-chip>
          </v-col>

          <v-col cols="auto">
            <AddGroupDialog
              v-if="user_is_author"
              @selection="add_group($event)"/>
          </v-col>

        </v-row>

      </v-card-text>
      <v-card-text>



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
              align="baseline"
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
                  icon
                  :disabled="index === 0"
                  @click="move_field(index, -1)">
                  <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
                <v-btn
                  icon
                  :disabled="index === template.properties.fields.length - 1"
                  @click="move_field(index, 1)">
                  <v-icon>mdi-arrow-down</v-icon>
                </v-btn>
              </v-col>
              <v-col
                v-if="user_is_author"
                cols="auto">
                <v-btn
                  icon
                  color="#c00000"
                  @click="delete_field(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>

          </v-card-text>

        </v-card>

      </v-card-text>
    </template>




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
      loading: false,
      saving: false,
      deleting: false,
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
      this.loading = true
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.get(url)
      .then(({ data }) => { this.template = data })
      .catch(error => console.log(error))
      .finally(() => {this.loading = false})
    },

    update_template () {

      this.saving = true
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
      .finally(() => { this.saving = false })

    },

    add_group(group){
      if(!this.template.groups) this.$set(this.template,'groups',[])
      this.template.groups.push(group)
    },

    remove_group(index){
      this.template.groups.splice(index,1)
    },

    delete_template(){
      if(!confirm(`Delete template ${this.template_id}?`)) return
      this.deleting = true
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.delete(url)
      .then( () => {
        this.$router.push({name: 'templates'})
      })
      .catch( error => {
        console.error(error)
        if(error.response) this.error_message = error.response.data
      })
      .finally(() => { this.deleting = false })
    },
    add_field () {
      this.template.properties.fields.push({ type: 'text', label: '' })
    },
    move_field(index, step){
      const item = this.template.properties.fields[index]
      const next_item = this.template.properties.fields[index + step]
      this.$set(this.template.properties.fields,index + step,item)
      this.$set(this.template.properties.fields,index,next_item)
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
