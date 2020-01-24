<template>
  <div class="">

    <div class="template_editor" v-if="is_editable">
      <div class="title_wrapper">
        <label for="">申請タイトル / Title</label>
        <input type="text" v-model="label">
      </div>

      <div class="">
        <div class="visibility_header" v-if="visibility_target">
          Sharing with {{visibility_target.properties.original_name}}
        </div>
        <div class="visibility_header" v-else>
          Please select with whom to share
        </div>
        <div class="corporate_structure">

          <CorporateStructureNode
            v-for="division in divisions"
            v-bind:nodeData="division"
            v-bind:key="division._fields[0].identity.low"
            v-bind:personalInformation="personal_information"
            v-on:nodeSelected="node_selected($event)"/>
        </div>
      </div>




      <div class="fields_wrapper">
        <div class="buttons_wrapper">
          <IconButton
            class="add_field_button"
            v-on:clicked="add_field()"
            icon="mdi-add"
            bordered>
            フィールド作成 / Add field</IconButton>
        </div>


        <div class="field" v-for="(field, index) in fields">

          <div class="">
            <label for="">ラベル / Label</label>
            <input type="text" v-model="field.label">
          </div>

          <div class="">
            <label for="">タイプ / Type</label>
            <select class="" v-model="field.type">
              <option
                v-for="field_type in field_types"
                v-bind:value="field_type.type">{{field_type.label}}</option>
            </select>
          </div>

          <IconButton
            v-on:clicked="delete_field(index)"
            icon="mdi-delete"
            v-bind:disabled="!!$route.query.id"/>

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
          icon="mdi-delete"
          bordered
          v-bind:disabled="!!$route.query.id">
          削除 / Delete</IconButton>

      </div>
    </div>

    <!-- view for people who do not own the template -->
    <div class="template_editor" v-else-if="author">
      <div class="">
        Title: {{label}}
      </div>
      <div class="">
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
        Shared with: {{visibility_target.properties.original_name}}
      </div>
      <div class="form_author">
        Form created by: {{author.properties.name_kanji}}
      </div>
    </div>







  </div>
</template>

<script>

import CorporateStructureNode from '@/components/jtekt_vue_employee_picker/CorporateStructureNode.vue'
import IconButton from '@/components/IconButton.vue'


export default {
  name: 'EditApplicationTemplate',
  components: {
    CorporateStructureNode,
    IconButton
  },
  data(){
    return {

      // used by CorporateStructureNode
      divisions: [],
      personal_information: null,

      visibility_target: undefined,
      author: undefined,


      field_types: [
        {type: 'text', label: 'テキスト / Text'},
        {type: 'file', label: 'ファイル / File'},
        {type: 'checkbox', label: 'チェックボックス / Checkbox'},
        {type: 'date', label: '日付 / Date'},
      ],

      label: "タイトル",
      fields : [
        {type: "text", label: "label"}
      ],

      // attempt to simplify passing data to back end
      // NOT USED YET
      template_data: {
        label: "",
        fields: [
          {type: "text", label: "label"} // default line
        ],
        shared_with: undefined, // this is used for a relationship
        id: undefined,
      },

    }
  },
  mounted(){
    this.get_template_if_exists();
    this.get_corporate_structure();
  },
  methods: {

    get_template_if_exists(){
      if('id' in this.$route.query){
        this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_application_form_template', {
          id: this.$route.query.id
        })
        .then( (response) => {
          let parsed_fields = JSON.parse(response.data[0]._fields[0].properties.fields)

          this.fields.splice(0,this.fields.length)
          parsed_fields.forEach(field => this.fields.push(field))
          this.label=response.data[0]._fields[0].properties.label

          // set the visibility target back
          this.visibility_target = Object.assign({}, this.visibility_target, response.data[0]._fields[response.data[0]._fieldLookup['g']])
          this.author = Object.assign({}, this.visibility_target, response.data[0]._fields[response.data[0]._fieldLookup['creator']])

        })
        .catch(error => console.log(error));
      }
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
      if(this.visibility_target){
        // If id exists, then edit
        if('id' in this.$route.query){
          this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/edit_application_form_template', {
            fields: this.fields,
            label: this.label,
            target_id: this.visibility_target.identity.low,
            id: this.$route.query.id,
          })
          .then( () => this.$router.push({ name: 'application_template_list' }))
          .catch(error => console.log(error));
        }
        // otherwise create
        else{
          this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/create_application_form_template', {
            fields: this.fields,
            label: this.label,
            target_id: this.visibility_target.identity.low,
          })
          .then( () => this.$router.push({ name: 'application_template_list' }))
          .catch(error => console.log(error));
        }
      }
      else {
        alert("Did not define who to share with")
      }
    },
    delete_template(id){
      if(confirm('ホンマ？')){
        this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/delete_application_form_template',
        {id:this.$route.query.id})
        .then( (response) => this.$router.push({ name: 'application_template_list' }) )
        .catch(error => console.log(error));
      }

    },
    get_corporate_structure(){
      this.axios.post(process.env.VUE_APP_AUTHENTICATION_MANAGER_URL + '/personal_information_v2', {})
      .then(response => {
        this.personal_information = response.data[0];

        this.axios.post(process.env.VUE_APP_AUTHENTICATION_MANAGER_URL + '/get_all_divisions', {})
        .then(response => this.divisions = response.data)
        .catch(error => console.log(error));

      })
      .catch(error => console.log(error));
    },
    node_selected(node){
      this.visibility_target = node
    }

  },
  computed: {
    is_editable(){
      if(!this.$route.query.id) return true;
      else if(this.personal_information && this.author){

        let self_id = this.personal_information._fields[this.personal_information._fieldLookup['employee']].identity.low
        let author_id = this.author.identity.low

        if(self_id === author_id) return true

      }

      return false;
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
  margin: 10px;
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
  margin: 10px;
  text-align: left;
  border-collapse: collapse;
}

.fields_table tr:not(:first-child){
  border-top: 1px solid #dddddd;
}

.buttons_wrapper{
  display: flex;
  justify-content: space-around;
  padding: 10px;
}
.add_field_button{
  font-size: 110%;
}
</style>
