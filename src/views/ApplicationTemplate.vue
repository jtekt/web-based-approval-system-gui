<template>
  <div class="">
    <h1>フォーム / Forms</h1>

    <!-- template is editable if new form of if current user is author -->
    <template v-if="is_editable">

      <h2>フォームデータ / Form data</h2>

      <div class="template_metadata_wrapper">

        <div class="title_wrapper">
          <label for="">タイトル / Title</label>
          <input type="text" v-model="label" placeholder="タイトル / Title">
        </div>

        <div class="description_wrapper">
          <label for="">説明 / Description</label>
          <textarea rows="8" v-model="description"/>
        </div>

        <div class="">
          <label for="">共有 / Visibility</label>
          <div class="">
            <!-- Approal flow group (dummy group) -->
            <div class="visibility_group">
              <span>
                著者 / Author
              </span>
              <div class="growing_spacer"/>

              <button type="button" disabled>
                <delete-icon />
              </button>
            </div>

            <div
              v-for="(group, index) in groups"
              class="visibility_group"
              v-bind:key="`shared_group_${index}`">

              <span class="">
                {{group.properties.name}}
              </span>

              <div class="growing_spacer"/>

              <button type="button"
                @click="delete_group(index)">
                <delete-icon />
              </button>

            </div>

            <!-- Button to add a group to visibility -->
            <div
              class="visibility_group_add_button_wrapper">
              <button
                type="button"
                @click="modal_open = true">
                <account-multiple-plus-icon />
                <span>グループ追加 / Add a group</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      <!-- fields -->
      <h3>フィールド / Fields</h3>
      <template v-if="fields.length > 0">

        <table class="fields_table">
          <thead>
            <tr>
              <th>ラベル / Label</th>
              <th>タイプ / Type</th>
              <th class="delete_cell">削除 / Delete</th>
              <th class="delete_cell">Reorder</th>
            </tr>
          </thead>

          <draggable v-model="fields" tag="tbody">
            <tr
              v-for="(field, index) in fields"
              v-bind:key="`field_${index}`">

              <!-- Field label input -->
              <td>
                <input type="text" v-model="field.label" placeholder="例：パソコン番号">
              </td>

              <!-- Field type select -->
              <td>
                <select class="" v-model="field.type">
                  <option
                    v-for="(field_type, index) in field_types"
                    :key="`type_${index}`"
                    :value="field_type.type">
                    {{field_type.label}}
                  </option>
                </select>
              </td>

              <!-- Delete field -->
              <td class="delete_cell">
                <button
                  type="button"
                  @click="delete_field(index)">
                  <delete-icon />
                </button>
              </td>

              <td class="delete_cell">
                <menu-icon />
              </td>

            </tr>
          </draggable>

        </table>

      </template>
      <div class="" v-else>
        No fields
      </div>

      <div class="buttons_wrapper">

        <button
          type="button"
          class="bordered"
          @click="add_field()">
          <plus-icon />
          <span>フィールド作成 / Add field</span>
        </button>
      </div>

      <div class="buttons_wrapper">

        <button
          type="button"
          class="bordered"
          :disabled="fields.length === 0"
          @click="submit()">
          <content-save-icon />
          <span>保存 / Save</span>
        </button>

        <button
          type="button"
          class="bordered"
          v-if="!!template_id"
          @click="delete_template()">
          <delete-icon />
          <span>削除 / Delete</span>
        </button>

      </div>

      <!-- Model used for group visibility -->
      <Modal
        :open="modal_open"
        @close="modal_open=false">
        <h2 class="">共有 / Visibility</h2>
        <div class="group_picker_wrapper">
          <GroupPicker
            class="picker"
            v-on:selection="add_to_groups($event)"/>
        </div>
      </Modal>
    </template>

    <!-- view for people who do not own the template -->
    <template v-else>
      <h2>{{label}}</h2>

      <div class="template_metadata_wrapper">
        <div class="author_wrapper" v-if="author">
          <label for="">著者 / Author</label>
          <UserPreview :user="author" />
        </div>

        <div class="description_wrapper">
          <label for="">説明 / Description</label>
          <textarea rows="8" v-model="description" readonly/>
        </div>

        <div class="">
          <label for="">共有 / Visibility</label>
          <div class="">
            <div class="visibility_group">
              <span>著者 / Author</span>
            </div>

            <div
              v-for="(group, index) in groups"
              class="visibility_group"
              :key="`shared_group_${index}`">

              <span class="">{{group.properties.name}}</span>

            </div>

          </div>
        </div>

      </div>

      <!-- fields -->
      <h3>フィールド / Fields</h3>
      <table class="fields_table">
        <tr>
          <th>Label</th>
          <th>Type</th>
        </tr>
        <tr
          v-for="(field, index) in fields"
          :key="`field_${index}`">
          <td>{{field.label}}</td>
          <td>{{field.type}}</td>
        </tr>
      </table>

    </template>

  </div>
</template>

<script>

import GroupPicker from '@moreillon/vue_group_picker'
import Modal from '@moreillon/vue_modal'
import UserPreview from '@/components/UserPreview.vue'
import CurrentUserID from '@/mixins/CurrentUserID.js'
import draggable from 'vuedraggable'

export default {
  name: 'ApplicationTemplate',
  components: {
    Modal,
    GroupPicker,
    UserPreview,
    draggable
  },
  mixins: [
    CurrentUserID
  ],
  data () {
    return {

      groups: [],

      field_types: [
        { type: 'text', label: 'テキスト / Text' },
        { type: 'file', label: 'ファイル / File' },
        { type: 'checkbox', label: 'チェックボックス / Checkbox' },
        { type: 'date', label: '日付 / Date' },
        { type: 'link', label: 'リンク / Link' },
        { type: 'application', label: '申請番号 / Application no' }
      ],

      label: '',
      description: '',

      fields: [
        { type: 'text', label: '' }

      ],

      author: null,

      modal_open: false

    }
  },
  mounted () {
    if (this.template_id) this.get_template()
  },
  methods: {

    get_template () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.get(url)
        .then(({ data }) => {
          const record = data
          const aft = record._fields[record._fieldLookup['aft']]

          const parsed_fields = JSON.parse(aft.properties.fields)

          this.fields = []
          parsed_fields.forEach(field => this.fields.push(field))

          this.label = aft.properties.label
          this.description = aft.properties.description

          this.author = record._fields[record._fieldLookup['creator']]

          this.groups = record._fields[record._fieldLookup['groups']]
        })
        .catch(error => console.log(error))
    },

    add_field () {
      this.fields.push({ type: 'text', label: '' })
    },
    delete_field (index) {
      if (!confirm('ホンマ？')) return
      this.fields.splice(index, 1)
    },
    submit () {
      if (this.template_id) this.update_template()
      else this.create_template()
    },
    create_template () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates`
      const group_ids = this.groups.map((group) => {
        return group.identity.low || group.identity
      })

      const body = {
        fields: this.fields,
        label: this.label,
        description: this.description,
        group_ids
      }

      this.axios.post(url, body)
        .then(() => { this.$router.push({ name: 'application_templates' }) })
        .catch(error => {
          alert('Error while creating the template')
          console.log(error)
        })
    },
    update_template () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`

      const group_ids = this.groups.map((group) => {
        return group.identity.low || group.identity
      })

      const body = {
        fields: this.fields,
        label: this.label,
        description: this.description,
        group_ids
      }

      this.axios.put(url, body)
        .then(() => { this.$router.push({ name: 'application_templates' }) })
        .catch(error => {
          alert('Error while updating the template')
          console.log(error)
        })
    },
    delete_template () {
      if (!confirm('ホンマ？ / Really?')) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.delete(url)
        .then((response) => this.$router.push({ name: 'application_templates' }))
        .catch(error => {
          alert('Error while deleting the template')
          console.log(error)
        })
    },

    delete_group (index) {
      this.groups.splice(index, 1)
    },
    add_to_groups (group_to_add) {
      this.modal_open = false

      // Prevent duplicates
      const existing_group = this.groups.find(group => {
        const group_id = group.identity.low || group.identity
        const group_to_add_id = group_to_add.identity.low || group_to_add.identity
        return group_id === group_to_add_id
      })

      if (!existing_group) this.groups.push(group_to_add)
    }

  },
  computed: {
    is_editable () {
      // if this is a new template, automatically in edit mode
      if (!this.template_id) return true
      if (!this.$store.state.current_user || !this.author) return false
      return this.current_user_id === this.author.identity
    },

    template_id () {
      const id = this.$route.params.template_id
      if (!id || id === 'new') return undefined
      else return id
    }
  }
}
</script>

<style scoped>

.template_editor > * {
  margin: 10px;
  border: 1px solid #dddddd;
  padding: 10px;
}

.template_metadata_wrapper > div {
  display: flex;
  padding: 0.5em 0;
}

.template_metadata_wrapper > div:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}
.template_metadata_wrapper > div > *:first-child{
  flex-basis: 10em;
  flex-shrink: 0;
}
.template_metadata_wrapper > div > *:last-child{
  flex-grow: 1;
}

.fields_table {
  width: 100%;
  margin: 1em 0;
  text-align: left;
  border-collapse: collapse;
}

.fields_table th, .fields_table td{
  padding: 0.25em;
}

.fields_table tr:not(:first-child){
  border-top: 1px solid #dddddd;
}

.fields_table .delete_cell{
  text-align: center;
}
.fields_table input,
.fields_table select {
  width: 100%;
}

.buttons_wrapper{
  margin-top: 2em;
  display: flex;
  justify-content: space-around;
  padding: 10px;
}
.add_field_button{
  font-size: 110%;
}

.group_picker_wrapper {
  height: 50vh;
  width: 75vw;
}

.picker {
  height: 100%;
}

.group {
  display: flex;
  justify-content: space-between;
  padding: 0.25em 0;
}
.group:hover{
  background-color: #eeeeee;
}

.group:not(:last-child){
  border-bottom: 1px solid #dddddd;
}

.author_avatar {
  height: 1em;
  width: 1em;
  margin-right: 0.25em;
}

.author_name {
  display: inline-flex;
  align-items: center;
}

.visibility_group {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.25em;
}

.visibility_group:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}
</style>
