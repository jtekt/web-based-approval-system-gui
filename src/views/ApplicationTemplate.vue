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
      </div>

      <!-- fields -->
      <h3>フィールド / Fields</h3>
      <template v-if="fields.length > 0">

        <table class="fields_table">
          <tr>
            <th>ラベル / Label</th>
            <th>タイプ / Type</th>
            <th class="delete_cell">削除 / Delete</th>
          </tr>
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
                  v-for="field_type in field_types"
                  v-bind:value="field_type.type">{{field_type.label}}</option>
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

          </tr>
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


      <h2>共有 / sharing</h2>

      <div class="picker_wrapper">
        <GroupPicker
          class="corporate_structure"
          :apiUrl="picker_api_url"
          v-on:selection="add_to_groups($event)"/>
      </div>

      <!-- DIRTY to use p but for now it'll do -->
      <p class="">
        このフォームがこちらのグループと共有されます / This form will be shared with the following:
      </p>

      <div class="groups_wrapper" v-if="groups.length > 0">
        <div class="group"
          v-for="(group, index) in groups"
          v-bind:key="group.identity.low">
          <span>{{group.properties.name}}</span>

          <button type="button"
            @click="delete_group(group)">
            <delete-icon />
          </button>

        </div>
      </div>
      <div class="error_message" v-else>
        Template must be shared with at least one group
      </div>


      <div class="buttons_wrapper">

        <button
          type="button"
          class="bordered"
          :disabled="groups.length === 0 || fields.length === 0"
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
    </template>

    <!-- view for people who do not own the template -->
    <template v-else>
      <h2>{{label}}</h2>

      <div class="template_metadata_wrapper">
        <div class="author_wrapper" v-if="author">
          <label for="">Author</label>
          <a
            :href="author_profile_url"
            class="author_name">
            <img
              class="author_avatar"
              v-if="author.properties.avatar_src"
              :src="author.properties.avatar_src">
            <span>
              {{ author.properties.display_name
                || author.properties.name_kanji
                || author.properties.name
                || author.properties.username}}
            </span>
          </a>
        </div>

        <div class="description_wrapper">
          <label for="">説明 / Description</label>
          <textarea rows="8" v-model="description" readonly/>
        </div>
      </div>

      <!-- fields -->
      <h3>フィールド / Fields</h3>
      <table class="fields_table">
        <tr>
          <th>Label</th>
          <th>Type</th>
        </tr>
        <tr v-for="field in fields">
          <td>{{field.label}}</td>
          <td>{{field.type}}</td>
        </tr>
      </table>

      <h2>共有 / sharing</h2>
      <div class="groups_wrapper" v-if="groups.length > 0">
        <div class="group"
          v-for="(group, index) in groups"
          v-bind:key="group.identity.low">
          <span>{{group.properties.name}}</span>
        </div>
      </div>
      <div class="" v-else>
        共有無し / No sharing
      </div>



    </template>

  </div>
</template>

<script>

import GroupPicker from '@moreillon/vue_group_picker'

import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import ContentSaveIcon from 'vue-material-design-icons/ContentSave.vue'

export default {
  name: 'ApplicationTemplate',
  components: {
    GroupPicker,
    DeleteIcon,
    PlusIcon,
    ContentSaveIcon,
  },
  data () {
    return {

      groups: [],

      field_types: [
        { type: 'text', label: 'テキスト / Text' },
        { type: 'file', label: 'ファイル / File' },
        { type: 'checkbox', label: 'チェックボックス / Checkbox' },
        { type: 'date', label: '日付 / Date' }
      ],

      label: '',
      description: '',

      fields: [
        { type: 'text', label: '' },

      ],

      author: null

    }
  },
  mounted () {
    if (this.template_id) {
      this.get_template()
      //this.get_visibility()
    }
  },
  methods: {

    get_template () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
      this.axios.get(url)
      .then((response) => {
        let record = response.data
        let aft = record._fields[record._fieldLookup['aft']]

        let parsed_fields = JSON.parse(aft.properties.fields)

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
      if (confirm('ホンマ？')) {
        this.fields.splice(index, 1)
      }
    },
    submit () {
      // If id exists, then edit
      if (this.template_id) {
        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
        this.axios.put(url, {
          fields: this.fields,
          label: this.label,
          description: this.description,
          group_ids: this.groups.map(group => group.identity.low),
        })
        .then(() => this.$router.push({ name: 'application_templates' }))
        .catch(error => console.log(error))
      }
      // otherwise create
      else {
        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates`
        this.axios.post(url, {
          fields: this.fields,
          label: this.label,
          description: this.description,
          group_ids: this.groups.map(group => group.identity.low)
        })
        .then(() => this.$router.push({ name: 'application_templates' }))
        .catch(error => console.log(error))
      }
    },
    delete_template (id) {
      if (confirm('ホンマ？ / Really?')) {
        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/${this.template_id}`
        this.axios.delete(url)
        .then((response) => this.$router.push({ name: 'application_templates' }))
        .catch(error => console.log(error))
      }
    },

    delete_group (index) {
      this.groups.splice(index, 1)
    },
    add_to_groups (group_to_add) {
      // Prevent duplicates
      if (!this.groups.includes(group_to_add)) {
        this.groups.push(group_to_add)
      }
    }

  },
  computed: {
    is_editable () {
      // if this is a new template, automatically in edit mode
      if (!this.template_id) return true
      if (!this.$store.state.current_user || !this.author) return false
      return this.$store.state.current_user.identity.low === this.author.identity.low
    },
    picker_api_url () {
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
    },
    author_profile_url(){
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/?id=${this.author.identity.low}`
    },
    template_id() {
      return this.$route.query.id
        || this.$route.params.id
        || this.$route.params.template_id
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
}
.template_metadata_wrapper > div:not(:first-child) {
  margin-top: 1em;
}
.template_metadata_wrapper > div > *:first-child{
  flex-basis: 10em;
  flex-shrink: 0;
}
.template_metadata_wrapper > div > *:last-child{
  flex-grow: 1;
}


.visibility_header{
  padding: 10px;
}
.corporate_structure {

  max-height: 300px;
  overflow-y: auto;
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
  height: 200px;
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
</style>
