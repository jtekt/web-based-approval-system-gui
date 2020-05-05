<template>
  <div class="">
    <h1>フォーム / Forms</h1>

    <!-- template is editable if new form of if current user is author -->
    <template v-if="is_editable">

      <div class="fields_wrapper">
        <h2>フォームデータ / Form data</h2>

        <div class="title_wrapper">
          <label for="">イトル / Template title</label>
          <input type="text" v-model="label" placeholder="タイトル / Title">
        </div>

        <div class="">
          <h3>フィールド / Fields</h3>
          <div class="field" v-for="(field, index) in fields">

            <div class="">
              <label for="">ラベル / Label</label>
              <input type="text" v-model="field.label" placeholder="例：パソコン番号">
            </div>

            <div class="">
              <label for="">タイプ / Type</label>
              <select class="" v-model="field.type">
                <option
                  v-for="field_type in field_types"
                  v-bind:value="field_type.type">{{field_type.label}}</option>
              </select>
            </div>

            <!-- Button to edit a field -->
            <IconButton
              v-on:clicked="delete_field(index)"
              icon="mdi-delete"/>
          </div>
        </div>


        <div class="buttons_wrapper">
          <IconButton
            class="add_field_button"
            v-on:clicked="add_field()"
            icon="mdi-add"
            bordered>
            フィールド作成 / Add field</IconButton>
        </div>


      </div>

      <div class="">
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
            <button type="button" v-on:click="delete_group(index)">delete</button>

          </div>
        </div>
        <div class="" v-else>
          共有無し / No sharing
        </div>

      </div>



      <div class="buttons_wrapper">

        <IconButton
          v-on:clicked="submit()"
          icon="mdi-content-save"
          bordered>
          保存 / Save</IconButton>

        <IconButton
          v-on:clicked="delete_template()"
          v-if="!!$route.query.id"
          icon="mdi-delete"
          bordered>
          削除 / Delete</IconButton>

      </div>
    </template>

    <!-- view for people who do not own the template -->
    <template v-else>
      <div class="">
        <h2>{{label}}</h2>

        <div class="" v-if="author">
          Author: {{author.properties.username}}
        </div>

        <!-- fields -->
        <div class="">
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
        </div>

        <div class="">
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

        </div>

      </div>



    </template>

  </div>
</template>

<script>

import IconButton from '@/components/IconButton.vue'

import GroupPicker from '@moreillon/vue_group_picker'

export default {
  name: 'ApplicationTemplate',
  components: {
    GroupPicker,
    IconButton
  },
  data(){
    return {


      groups: [],


      field_types: [
        {type: 'text', label: 'テキスト / Text'},
        {type: 'file', label: 'ファイル / File'},
        {type: 'checkbox', label: 'チェックボックス / Checkbox'},
        {type: 'date', label: '日付 / Date'},
      ],

      label: "",

      fields : [
        {type: "text", label: ""},
        {type: "text", label: ""},
        {type: "text", label: ""},
      ],


      author: null,


    }
  },
  mounted(){
    if('id' in this.$route.query){
      this.get_template()
      this.get_visibility()
    }
  },
  methods: {

    get_template(){

      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_template`, {
        params: {id: this.$route.query.id}
      })
      .then( (response) => {

        let record = response.data[0]
        let aft = record._fields[record._fieldLookup['aft']]

        let parsed_fields = JSON.parse(aft.properties.fields)

        this.fields = []
        parsed_fields.forEach(field => this.fields.push(field))

        this.label=aft.properties.label

        this.author = record._fields[record._fieldLookup['creator']]

      })
      .catch(error => console.log(error));

    },

    get_visibility(){
      // Gets the groups wi which this application is visible
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_template/visibility`, {
        params: {id: this.$route.query.id},
      })
      .then(response => {
        this.groups = []
        response.data.forEach((record) => {
          let group = record._fields[record._fieldLookup['group']]
          this.groups.push(group)
        });
      })
      .catch((error) => console.log(error))
    },

    add_field(){
      this.fields.push({type: "text", label: "label"})
    },
    delete_field(index){
      if(confirm('ホンマ？')){
        this.fields.splice(index,1)
      }
    },
    submit(){
      // If id exists, then edit
      if('id' in this.$route.query){
        this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/edit_application_form_template`, {
          fields: this.fields,
          label: this.label,
          group_ids: this.groups.map(group => group.identity.low),
          id: this.$route.query.id,
        })
        .then( () => this.$router.push({ name: 'application_template_list' }))
        .catch(error => console.log(error));
      }
      // otherwise create
      else{
        this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/create_application_form_template`, {
          fields: this.fields,
          label: this.label,
          group_ids: this.groups.map(group => group.identity.low),
        })
        .then( () => this.$router.push({ name: 'application_template_list' }))
        .catch(error => console.log(error));
      }


    },
    delete_template(id){
      if(confirm('ホンマ？')){
        this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/delete_application_form_template`,
        {id:this.$route.query.id})
        .then( (response) => this.$router.push({ name: 'application_template_list' }) )
        .catch(error => console.log(error));
      }

    },

    delete_group(index){
      this.groups.splice(index,1);
    },
    add_to_groups(group_to_add){
      // Prevent duplicates
      if(!this.groups.includes(group_to_add)){
        this.groups.push(group_to_add);
      }

    },

  },
  computed: {
    is_editable(){
      // if this is a new template, automatically in edit mode
      if(!this.$route.query.id) return true;
      if(!this.$store.state.current_user || !this.author) return false
      return this.$store.state.current_user.identity.low === this.author.identity.low

    },
    picker_api_url(){
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
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

.field {
  display: flex;
  margin: 1em 0;
}

.field:not(:last-child){
  border-bottom: 1px solid #dddddd;
}
.field > * {
  margin: 0 10px;
  flex-grow: 1;
}

label {
  margin-right: 10px;
}

.visibility_header{
  padding: 10px;
}
.corporate_structure {


  max-height: 300px;
  overflow-y: auto;
}

.fields_table {
  margin: 1em 0;
  text-align: left;
  border-collapse: collapse;
}

.fields_table tr:not(:first-child){
  border-top: 1px solid #dddddd;
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
</style>
