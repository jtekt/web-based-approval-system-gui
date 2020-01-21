<template>
  <div class="template_editor">

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
      <div class="">
        <button type="button" v-on:click="add_field()">add field</button>
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

        <button type="button" v-on:click="delete_field(index)">delete</button>

      </div>
    </div>

    <div class="">
      <button type="button" v-on:click="submit()">submit</button>
    </div>






  </div>
</template>

<script>

import CorporateStructureNode from '@/components/jtekt_vue_employee_picker/CorporateStructureNode.vue'


export default {
  name: 'EditApplicationTemplate',
  components: {
    CorporateStructureNode
  },
  mixins: [],
  data(){
    return {

      divisions: [],
      personal_information: null,
      visibility_target: undefined,


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

    }
  },
  mounted(){
    this.get_template_if_exists();
    this.get_corporate_structure();
  },
  methods: {
    get_template_if_exists(){
      if('id' in this.$route.query){
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_application_form_template', {
          id: this.$route.query.id
        })
        .then( (response) => {
          console.log(response)
          let parsed_fields = JSON.parse(response.data[0]._fields[0].properties.fields)
          parsed_fields.forEach(field => this.fields.push(field))
          this.label=response.data[0]._fields[0].properties.label

          // reset visibility target
          this.visibility_target = Object.assign({}, this.visibility_target, response.data[0]._fields[response.data[0]._fieldLookup['g']])

        })
        .catch(error => console.log(error));
      }
    },
    add_field(){
      this.fields.push({type: "text", label: "label"})
    },
    delete_field(index){
      this.fields.splice(index,1)
    },
    submit(){
      if(this.visibility_target){
        if('id' in this.$route.query){
          this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/edit_application_form_template', {
            fields: this.fields,
            label: this.label,
            id: this.$route.query.id,
            target_id: this.visibility_target.identity.low,
          })
          .then( () => this.$router.push({ name: 'application_template_list' }))
          .catch(error => console.log(error));
        }
        else{
          this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/create_application_form_template', {
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
    get_corporate_structure(){
      this.axios.post('http://authentication.mike.jtekt.maximemoreillon.com/personal_information_v2', {})
      .then(response => {
        this.personal_information = response.data[0];

        this.axios.post('http://authentication.mike.jtekt.maximemoreillon.com/get_all_divisions', {})
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

</style>
