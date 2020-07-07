<template>
  <div>
    <h1>新しい申請 / New application</h1>

    <!-- Creation of the approval flow -->
    <div class="">
      <h2>承認フロー / Approval flow</h2>

      <!-- Employee picker -->
      <UserPicker
        class="picker"
        :apiUrl="picker_api_url"
        v-on:selection="add_to_recipients($event)"/>

      <!-- Approval flow -->
      <ApprovalFlow
        class="flow_container"
        v-on:deleteEmployee="delete_recipient($event)"
        v-bind:employees="recipients"/>

    </div>

    <div class="">
      <h2>申請内容 / Application content</h2>

    </div>

    <!-- test with user generated form selector -->
    <div class="type_and_title_input_wrapper section_wrapper">

      <!-- title input -->
      <div class="title_wrapper">
        <label>申請タイトル / Title: </label>
        <input type="text" class="title_input" v-model="title">
      </div>

      <!-- type selector -->
      <div class="">
        <label>申請種類 / type: </label>

        <!-- if the form is filled from scratch -->
        <template v-if="!$route.query.copy_of">
          <span v-if="application_form_templates.loading">Loading...</span>
          <span v-else-if="application_form_templates.error">{{application_form_templates.error}}</span>
          <select
            v-else v-model="selected_form">
            <!--<option value=undefined>Please select</option>-->
            <option
              v-for="application_type in application_form_templates"
              v-bind:value="application_type">
              {{application_type.properties.label}}
            </option>
          </select>
        </template>

        <!-- if the form is a duplicate -->
        <template v-else>
          <span v-if="selected_form.error">Error duplicating form {{copy_of}}</span>
          <span v-else-if="selected_form.loading">Loading</span>
          <span v-else-if="selected_form.properties">
            {{selected_form.properties.label}} (Duplicate of ID {{$route.query.copy_of}})
            <a href="create_application">Start from scratch</a>
          </span>
        </template>

      </div>

      <!-- privacy selector -->
      <div class="">
        機密 / Confidential: <input type="checkbox" v-model="private">
      </div>

      <!-- Sharing with groups -->
      <template v-if="private">
        <div class="group_picker_wrapper">
          <GroupPicker
            :apiUrl="picker_api_url"
            v-on:selection="add_to_groups($event)"/>
        </div>

        <div class="">
          この申請が承認フローとこちらのグループと共有されています / This application will be shared with the following groups:
        </div>

        <div class="groups_wrapper" v-if="groups.length > 0">
          <div class="group"
            v-for="(group, index) in groups"
            v-bind:key="group.identity.low">
            <span>{{group.properties.name}}</span>
            <button type="button" v-on:click="delete_group(index)">delete</button>

          </div>
        </div>
        <div class="" v-else>
          承認フローのみ / Only approval flow
        </div>
      </template>

    </div>

    <!-- container for the application itself -->
    <div class="section_wrapper form_container" >
      <template v-if="selected_form.properties">
        <div class="form_title">{{selected_form.properties.label}}</div>

        <textarea
          v-if="selected_form.properties.description"
          class="template_description"
          rows="8"
          v-model="selected_form.properties.description" readonly/>

        <!-- Link to the template's page -->
        <div class="link_to_template" v-if="selected_form.identity">
          <router-link :to="{ name: 'application_template', query: {id: selected_form.identity.low} }">
            Template details
          </router-link>
        </div>

        <table class="form_content_table">
          <tr
            v-for="(field, index) in selected_form.properties.fields">
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
      </template>
      <template v-else>申請種類が選ばれていません / Application type not selected</template>
    </div>

    <div class="submit_button_container" >

      <IconButton
        v-on:clicked="create_application()"
        icon="mdi-send"
        bordered
        v-bind:disabled="!form_valid">
        送る / Send</IconButton>

    </div>

  </div>
</template>

<script>

// UI elements
import ApprovalFlow from '@/components/ApprovalFlow.vue'
import UserPicker from '@moreillon/vue_user_picker'
import GroupPicker from '@moreillon/vue_group_picker'

import Datepicker from 'vuejs-datepicker'
import IconButton from '@/components/IconButton.vue'

export default {
  name: 'CreateApplication',
  components: {
    UserPicker,
    GroupPicker,
    ApprovalFlow,
    Datepicker,
    IconButton
  },

  data () {
    return {
      title: '',
      private: false, // applications private by default
      recipients: [], // approval Flow, can be filled by duplication

      application_form_templates: [],
      selected_form: {},

      copy_of: '',

      groups: [] // Groups for visibility
    }
  },
  mounted () {
    this.copy_content_if_duplicate()
    this.get_templates()
  },
  methods: {

    copy_content_if_duplicate () {
      // Attempt to copy the content of one application into a new one
      // NOT VERY CLEAN but better than before
      if (this.$route.query.copy_of) {
        this.recreate_application_content()
        this.recreate_visibility()
        this.recreate_approval_flow()
      }
    },

    recreate_application_content () {
      // Todo: add a loader for the content of the application itself
      this.$set(this.selected_form, 'loading', true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.copy_of}`)
        .then(response => {
          let record = response.data[0]
          let original_application = record._fields[record._fieldLookup['application']]

          this.title = `Copy of ${original_application.properties.title}`
          this.private = original_application.properties.private

          original_application.properties.form_data = JSON.parse(original_application.properties.form_data)

          let fields = []
          original_application.properties.form_data.forEach((field) => {
            fields.push(field)
          })

          this.$set(this.selected_form, 'properties', {
            label: original_application.properties.type,
            fields: fields
          })
        })
        .catch((error) => {
          console.error(error)
          this.$set(this.selected_form, 'error', true)
        })
        .finally(() => this.$set(this.selected_form, 'loading', false))
    },

    recreate_visibility () {
      // Gets the groups wi which this application is visible (used if duplicate)
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.copy_of}/visibility`
      this.axios.get(url)
        .then(response => {
          this.groups = []
          response.data.forEach((record) => {
            let group = record._fields[record._fieldLookup['group']]
            this.groups.push(group)
          })
        })
        .catch(() => this.error = 'Error getting application')
    },

    recreate_approval_flow () {
      // Gets the groups wi which this application is visible (used if duplicate)
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.copy_of}/recipients`
      this.axios.get(url)
        .then(response => {
          this.recipients = []
          response.data.forEach((record) => {
            let recipient = record._fields[record._fieldLookup['recipient']]
            this.recipients.push(recipient)
          })
        })
        .catch((error) => {
          console.error(error)
          this.error = 'Error getting application'
        })
    },

    get_templates () {
      this.$set(this.application_form_templates, 'loading', true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/visible_to_user`)
        .then(response => {
        // delete templates to recreate them
          this.application_form_templates = []
          response.data.forEach(record => {
            let template = record._fields[record._fieldLookup['aft']]
            template.properties.fields = JSON.parse(template.properties.fields)
            this.application_form_templates.push(template)
          })
        })
        .catch(error => {
          console.error(error)
          this.$set(this.application_form_templates, 'error', 'Error loading templates')
        })
        .finally(() => this.$set(this.application_form_templates, 'loading', false))
    },

    create_application () {
      if (this.form_valid) {
        this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications`, {
          // Create the request body
          // TODO: there should be a simpler way to pass all that information
          title: this.title,
          recipients_ids: this.recipients.map(recipient => recipient.identity.low),
          form_data: this.selected_form.properties.fields,
          type: this.selected_form.properties.label,
          private: this.private,
          group_ids: this.groups.map(group => group.identity.low)
        })
          .then(response => {
          // Creation successful

            // send notification email to first recipient of flow
            if (confirm(`Application registered successfully. Send notification email to recipient?`)) {
              let recipient_email = this.recipients[0].properties.email_address
              let recipient_name = this.recipients[0].properties.name_kanji
              let application_type = response.data[0]._fields[0].properties.type
              let application_id = response.data[0]._fields[0].identity.low

              // Send email to first recipient
              // Weird formatting because respects identation
              window.location.href = `
mailto:${recipient_email}
?subject=[自動送信] ${application_type}を提出しました
&body=${recipient_name}　様%0D%0A
%0D%0A
提出先URL%0D%0A
${process.env.VUE_APP_SHINSEI_MANAGER_FRONT_URL}/show_application?id=${application_id}%0D%0A
%0D%0A
確認お願いします。%0D%0A
            `
            }

            // ask for deletion of original application if this one is a duplicate
            /*
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
          */
            this.$router.push({ name: '/' })
          })
          .catch(error => alert(error))
      } else alert('There are missing items in this application form')
    },

    delete_recipient (index) {
      this.recipients.splice(index, 1)
    },
    add_to_recipients (recipient_to_add) {
      // Prevent duplicates
      if (!this.recipients.includes(recipient_to_add)) {
        this.recipients.push(recipient_to_add)
      } else alert('Duplicates not allowed')
    },
    delete_group (index) {
      this.groups.splice(index, 1)
    },
    add_to_groups (group_to_add) {
      // Prevent duplicates
      if (!this.groups.includes(group_to_add)) {
        this.groups.push(group_to_add)
      }
    },
    file_upload (event, field) {
      let formData = new FormData()
      formData.append('file_to_upload', event.target.files[0])
      this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(response => {
        // Needed for responsiviity
        // Is this the right way?
          this.$set(field, 'value', response.data)
        })
        .catch(error => alert(error.response.data))
    },
    delete_file (field) {
      // Is this the right way to set value?
      this.$set(field, 'value', '')
    }
  },
  computed: {
    form_valid () {
      return this.selected_form &&
        this.recipients.length > 0 &&
        this.title
    },
    picker_api_url () {
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
    }
  }
}
</script>

<style scoped>

.section_wrapper{
  border: 1px solid #dddddd;
  margin: 1em 0;
  padding: 10px;
}

.picker {
  height: 300px;
}

.flow_container {
  margin-top: 1em;
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

}

.form_content_table {
  margin-top: 10px;
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

.template_description{
  border: 1px solid #dddddd;
  outline: none;
  width: 100%;
  margin-top: 0.5em;
  resize: vertical;
}

.link_to_template {
  margin-top: 0.5em;
}
</style>
