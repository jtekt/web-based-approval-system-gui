<template>

  <!-- Wrapping everything in a form might not be a good idea... -->
  <div>

    <!-- Employee picker -->
    <EmployeePicker v-on:employeeSelected="add_to_recipients($event)" />

    <!-- Approval flow -->
    <ApprovalFlow
      v-on:deleteEmployee="delete_recipient($event)"
      v-bind:employees="recipients"/>



    <!-- test with user generated form selector -->
    <div class="type_and_title_input_wrapper section_wrapper">

      <!-- title input -->
      <div class="title_wrapper">
        <label>申請タイトル / Title of the application: </label>
        <input type="text" class="title_input" v-model="title">
      </div>

      <!-- type selector -->
      <div class="">
        <label>申請種類 / Application type: </label>
        <select v-model="selected_form">
          <!--<option value=undefined>Please select</option>-->
          <option
            v-for="application_type in application_form_templates"
            v-bind:value="application_type">
            {{application_type._fields[0].properties.label}}
          </option>
        </select>
      </div>


    </div>


    <div class="section_wrapper form_container" >

      <div class="" v-if="selected_form">

        <div class="form_title">{{selected_form._fields[selected_form._fieldLookup['aft']].properties.label}}</div>


        <table class="form_content_table">
          <tr v-for="(field, index) in selected_form._fields[selected_form._fieldLookup['aft']].properties.fields">
            <td>{{field.label}}</td>

            <td>

              <!-- file input when file is not selected -->
              <input
                v-if="field.type === 'file' && !field.value"
                v-bind:type="field.type"
                v-on:change="file_upload($event, field)">

              <!-- file input when file is selected -->
              <span
                v-else-if="field.type === 'file' && field.value"
                class="mdi mdi-delete file_delete_button"
                v-on:click="delete_file(field)"/>


              <datepicker
                v-else-if="field.type === 'date'"
                v-model="field.value"/>


              <input
                v-else
                v-bind:type="field.type"
                v-model="field.value">

            </td>

          </tr>
        </table>

        <div class="form_author">
          Form made by {{selected_form._fields[selected_form._fieldLookup['creator']].properties.name_kanji}}
          ({{selected_form._fields[selected_form._fieldLookup['creator']].properties.email_address}})
        </div>
      </div>

      <div v-else>申請種類が選ばれていません / Application type not selected</div>

    </div>


    <div class="submit_button_container" >

      <span
        class="mdi mdi-send submit_button"
        v-bind:class="{disabled: !form_valid}"
        v-on:click="create_application()"> Send</span>

    </div>

  </div>
</template>

<script>

// UI elements
import EmployeePicker from '@/components/jtekt_vue_employee_picker/EmployeePicker.vue'
import ApprovalFlow from '@/components/ApprovalFlow.vue'

import Datepicker from 'vuejs-datepicker';

// Mixins
// Application types are gotten from this mixin


export default {
  name: 'CreateApplication',
  components: {
    EmployeePicker,
    ApprovalFlow,
    Datepicker
  },

  data(){
    return {
      title: "",
      recipients: [], // approval Flow
      application_form_templates: [],
      selected_form: undefined,
    }
  },
  mounted(){

    this.get_templates();

  },
  methods: {

    copy_content_if_duplicate(){
      // Attempt to copy the content of one application into a new one
      // NOT VERY CLEAN
      if(this.$route.query.copy_of){
        this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_application', {
          application_id: this.$route.query.copy_of
        })
        .then(response => {

          var application_properties = response.data[0]._fields[0].properties
          application_properties.form_data = JSON.parse(application_properties.form_data)

          // srt title back and add "Copy of"
          this.title = "Copy of " + application_properties.title

          // recreate flow
          response.data.reverse().forEach(recipient => {
            this.recipients.push({
              _fields: [recipient._fields[recipient._fieldLookup['recipient']]]
            });
          })


          // Set the correct application type back
          // the AFT is part of the response from the server
          let template_used_by_original = response.data[0]._fields[response.data[0]._fieldLookup['aft']]
          if(!template_used_by_original) return alert('Form template does not exist')

          // need to parse fields because saved as stringified JSON in DB
          template_used_by_original.properties.fields = JSON.parse(template_used_by_original.properties.fields)


          // find the corresponding template in the available templates (search by ID)
          let found_template = this.application_form_templates.find(e => {
            return e._fields[e._fieldLookup['aft']].identity.low === template_used_by_original.identity.low
          })


          if(!found_template) return alert('Form template does not exist')

          this.selected_form = found_template
          // check if fields match
          let selected_form_fields = this.selected_form._fields[this.selected_form._fieldLookup['aft']].properties.fields

          for (const [index, val] of selected_form_fields.entries()) {
            if(val.type === application_properties.form_data[index].type && val.label === application_properties.form_data[index].label){
              //console.log(original_form_fields[index])
              this.$set(val,'value',application_properties.form_data[index].value)
            }
            else {
              alert('There was a problem duplicating the application. The template seems to have changed.')
              break;
            }
          }

        })
        .catch(error => console.log(error));
      }
    },

    get_templates(){
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_all_application_form_templates')
      .then(response => {

        // delete templates to recreate them
        this.application_form_templates.splice(0,this.application_form_templates.length)

        response.data.forEach(template => {

          // need to parse fields because saved as stringified JSON in DB
          template._fields[0].properties.fields = JSON.parse(template._fields[0].properties.fields)

          this.application_form_templates.push(template)
        })
        // this needs to be done once templates are available
        this.copy_content_if_duplicate();
      })
      .catch(error => console.log(error));
    },


    create_application(){

      if(this.form_valid){
        this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/create_application', {
          title: this.title,
          recipients_employee_number: this.recipients.map(a => a._fields[0].properties.employee_number),
          session_id: this.$store.state.session_id,
          form_data: this.selected_form._fields[this.selected_form._fieldLookup['aft']].properties.fields,
          template_id: this.selected_form._fields[this.selected_form._fieldLookup['aft']].identity.low,

          // This is just in case the application template gets gets deleted afterwards
          type: this.selected_form._fields[this.selected_form._fieldLookup['aft']].properties.label,
        })
        .then(response => {
          // Creation successful

          // send notification email to first recipient of flow
          if(confirm(`Application registered successfully. Send notification email to recipient?`)){

            let recipient_email = this.recipients[0]._fields[0].properties.email_address;
            let application_type = response.data[0]._fields[0].properties.type
            let recipient_name = this.recipients[0]._fields[0].properties.name_kanji
            let application_id = response.data[0]._fields[0].identity.low

            // Send email to first recipient
            // Weird formatting because respects identation
            window.location.href = `
mailto:${recipient_email}
?subject=[自動送信] ${application_type}を提出しました
&body=${recipient_name}　様%0D%0A
%0D%0A
提出先URL%0D%0A
http://shinseimanager.mike.jtekt.maximemoreillon.com/show_application?id=${application_id}%0D%0A
%0D%0A
確認お願いします。%0D%0A
            `
          }

          // ask for deletion of original application if this one is a duplicate
          if(this.$route.query.copy_of){
            if(confirm('Delete previous application?')){
              this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/delete_application', {
                application_id: this.$route.query.copy_of
              })
              .then( () => this.$router.push({ name: 'submitted_applications' }))
              .catch(error => alert(error));
            }
            else this.$router.push({ name: 'submitted_applications' })
          }
          else this.$router.push({ name: 'submitted_applications' })

        })
        .catch(error => alert(error));
      }
      else alert("There are missing items in this application form")


    },

    get_employees_belonging_to_node(node_id){
      // This does not seem to be used
      this.axios.post(process.env.VUE_APP_AUTHENTICATION_MANAGER_URL + '/get_employees_belonging_to_node', {
        node_id: node_id,
      })
      .then(response => this.employees = response.data)
      .catch(error => console.log(error));
    },

    delete_recipient(recipient_index){
      this.recipients.splice(recipient_index,1);
    },
    add_to_recipients(recipient_to_add){

      // Prevent duplicates
      if(!this.recipients.includes(recipient_to_add)){
        this.recipients.push(recipient_to_add);
      }
      else alert("Duplicates not allowed")

    },
    file_upload(event, field){

      let formData = new FormData();
      formData.append('file_to_upload', event.target.files[0]);
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/file_upload', formData, {
        headers: {'Content-Type': 'multipart/form-data' }
      })
      .then(response => {
        // Needed for responsiviity
        // Is this the right way?
        this.$set(field,'value',response.data)
      })
      .catch(error => console.log(error));
    },
    delete_file(field){
      // Is this the right way to set value?
      this.$set(field,'value','')
    },
  },
  computed: {
    form_valid(){
      return this.selected_form
        && this.recipients.length > 0
        && this.title
    }
  }
}
</script>

<style scoped>

form > div {

}

.section_wrapper{
  border: 1px solid #dddddd;
  margin: 15px;
  padding: 10px;
}

.type_and_title_input_wrapper{
  /*
  display: flex;
  flex-wrap: wrap;
  */
}
.type_and_title_input_wrapper > div {
  margin: 10px;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
}

.type_and_title_input_wrapper > div > label {
  margin-right: 10px;
}


.employee {
  padding: 2px 5px;
  cursor: pointer;
}
.employee:hover {
  background-color: #dddddd;
}

.selected_recipients_container {
  display: flex;
}

.selected_recipient_container {
  display: flex;
}

.selected_recipient_details_container {

  border: 1px solid black;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;

  width: 12vmin;

  text-align: center;

}

.employee_name {

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow_container {
  padding: 5px;
  display: flex;
  align-items: center;
  font-size: 150%;

}

.title_wrapper {
  display: flex;
}

.title_input {
  flex-grow: 1;
}

.submit_button_container {
  text-align: center;
  padding: 15px;
}

.submit_button {
  border: 1px solid #444444;
  border-radius: 5px;
  padding: 5px;
  font-size: 150%;
  transition: color 0.25s border-color 0.25s;
}

.submit_button:not(.disabled){
  cursor: pointer;
}

.submit_button:not(.disabled):hover{
  color: #c00000;
  border-color: #c00000;
}

.submit_button.disabled{
  cursor: not-allowed;
}

.form_title{
  font-size: 150%;
  margin-bottom: 10px;
}



.form_content_table {
  width: 100%;
  border-collapse: collapse;
}

.form_content_table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.form_content_table th {
  text-align: left;
  padding: 10px;
}
.form_content_table td {
  padding: 5px;
}

.form_content_table td input[type="text"]{
  width: 100%;
}

.form_content_table .file_delete_button {
  font-size: 150%;
  cursor: pointer;
}

.form_author {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dddddd;
}
</style>
