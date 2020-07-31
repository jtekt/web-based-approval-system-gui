<template>
  <div>
    <h1>新しい申請 / New application</h1>

    <h2>① 申請 / Application</h2>

    <h3>申請情報 / Application details</h3>
    <table class="application_info">
      <tr>
        <td>申請タイトル / Application Title</td>
        <td>
          <input type="text" class="title_input" v-model="title" placeholder="申請タイトル / Title">
        </td>
      </tr>
      <tr>
        <td>申請種類 / type</td>
        <td>
          <!-- if the form is filled from scratch -->
          <template v-if="!$route.query.copy_of">
            <span v-if="application_form_templates.loading">Loading...</span>

            <span v-else-if="application_form_templates.error">
              {{application_form_templates.error}}
            </span>

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
        </td>
      </tr>
      <tr>
        <td>機密 / Confidential</td>
        <td>
          <input type="checkbox" v-model="private">
        </td>
      </tr>
      <!-- Visibility -->
      <tr v-if="private">
        <td>共有 / Visibility</td>
        <td class="visibility_wrapper">

          <!-- Approal flow group (dummy group) -->
          <div class="visibility_group">
            <span> 承認フロー / Approval flow</span>
            <div class="growing_spacer"/>
            <button type="button" disabled>
              <delete-icon />
            </button>
          </div>


          <div
            v-for="(group, group_index) in groups"
            class="visibility_group"
            v-bind:key="group.identity.low">

            <span class="">
              {{group.properties.name}}
            </span>

            <div class="growing_spacer"/>

            <button type="button"
              @click="delete_group(group_index)">
              <delete-icon />
            </button>

          </div>


          <!-- Button to add a group to visibility -->
          <div class="visibility_group_add_button_wrapper">
            <button
              type="button"
              @click="modal_open = true">
              <account-multiple-plus-icon />
              <span>グループ追加 / Add a group</span>
            </button>
          </div>

        </td>
      </tr>
    </table>


    <!-- container for the application itself -->
    <template v-if="selected_form.properties">

      <h3 class="form_template_title">
        <span>{{selected_form.properties.label}}</span>
        <button
          type="button"
          @click="view_form_template(selected_form.identity.low)" >
          <open-in-new-icon />
        </button>
      </h3>

      <table class="form_content_table">

        <!--
        <tr v-if="selected_form.identity">
          <td>フォーム詳細 / Form details</td>
          <td>
            <router-link :to="{ name: 'application_template', query: {id: selected_form.identity.low} }">
              フォームのページへ / Form page
            </router-link>
          </td>
        </tr>
        -->
        <!-- Application form description -->

        <tr v-if="selected_form.properties.description">
          <td>フォーム説明 / Form description</td>
          <td>
            <textarea
              class="template_description"
              rows="4"
              v-model="selected_form.properties.description"
              readonly/>
          </td>
        </tr>


        <tr
          v-for="(field, index) in selected_form.properties.fields">
          <td>
            {{field.label || 'Unnamed field'}}
          </td>

          <td>
            <!-- file input when file is not selected -->
            <template v-if="field.type === 'file'">

              <!-- SHow input when no file -->
              <input
                v-if="!field.value"
                :type="field.type"
                v-on:change="file_upload($event, field)">

              <!-- file input when file is selected -->
              <div
                v-else-if="field.value"
                class="attachment_controls_wrapper">
                <span
                  class="attatchment_confirm">
                  添付 OK / Attachment OK
                </span>
                <button
                  type="button"
                  @click="delete_file(field)">
                  <delete-icon />
                  <span>Delete</span>
                </button>
              </div>

            </template/>

            <input
              v-else
              v-bind:type="field.type"
              :placeholder="field.label"
              v-model="field.value">

          </td>

        </tr>
      </table>
    </template>
    <template v-else>
      <h3>申請内容 / Application content</h3>
      <p class="error_message">申請種類が選ばれていません / Application type not selected</p>

    </template>
    <!-- End of application -->

    <!-- Creation of the approval flow -->
    <h2>② 承認フロー / Approval flow</h2>

    <!-- Employee picker -->
    <h3>承認者選択 / Recipient selection</h3>
    <UserPicker
      class="picker"
      :apiUrl="picker_api_url"
      v-on:selection="add_to_recipients($event)"/>

    <!-- Approval flow -->
    <h3>承認フロー / Current flow</h3>
    <ApprovalFlow
      v-on:deleteEmployee="delete_recipient($event)"
      v-bind:employees="recipients"/>

    <h2>③ 申請書提出 / Submission</h2>
    <div class="submit_button_container" >

      <button
        type="button"
        class="bordered"
        @click="create_application()"
        :disabled="!form_valid">
        <send-icon />
        <span>送る / Send</span>
      </button>

    </div>

    <!-- Modal for group visibility -->
    <Modal :open="modal_open" @close="modal_open=false">
      <h2 class="">
        Share application with a group
      </h2>
      <div class="group_picker_wrapper">
        <GroupPicker
          class="visibility_group_picker"
          :apiUrl="picker_api_url"
          v-on:selection="add_to_groups($event)"/>
      </div>
    </Modal>

  </div>
</template>

<script>

// UI elements
import ApprovalFlow from '@/components/ApprovalFlow.vue'
import UserPicker from '@moreillon/vue_user_picker'
import GroupPicker from '@moreillon/vue_group_picker'
import Modal from '@moreillon/vue_modal'


export default {
  name: 'CreateApplication',
  components: {
    UserPicker,
    GroupPicker,
    ApprovalFlow,
    Modal,
  },

  data () {
    return {
      title: '',
      private: false, // applications private by default
      recipients: [], // approval Flow, can be filled by duplication

      application_form_templates: [],
      selected_form: {},

      copy_of: '',

      groups: [], // Groups for visibility
      // modal for group visibility
      modal_open: false,
    }
  },
  mounted () {
    if (this.$route.query.copy_of) this.recreate_application_content()
    this.get_templates()
  },
  methods: {
    recreate_application_content () {
      // Todo: add a loader for the content of the application itself
      this.$set(this.selected_form, 'loading', true)
      let application_id = this.$route.query.copy_of
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${application_id}`
      this.axios.get(url)
        .then(response => {

          let record = response.data

          let original_application = record._fields[record._fieldLookup['application']]
          let recipients = record._fields[record._fieldLookup['recipients']]
          let submissions = record._fields[record._fieldLookup['submissions']]

          // recreate visibility
          this.groups = record._fields[record._fieldLookup['visibility']]

          // Set application details back
          this.title = original_application.properties.title
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


          // Recreate flow
          let ordered_submissions = submissions.sort((a,b) => {
            return a.properties.flow_index.low - b.properties.flow_index.low
          })

          ordered_submissions.forEach((submission) => {
            let recipient_of_submission = recipients.find(recipient => {
              return JSON.stringify(recipient.identity) === JSON.stringify(submission.end)
            })
            this.recipients.push(recipient_of_submission)
          })

        })
        .catch((error) => {
          console.error(error)
          this.$set(this.selected_form, 'error', true)
        })
        .finally(() => this.$set(this.selected_form, 'loading', false))
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

          let application_id = response.data[0]._fields[0].identity.low

          this.$router.push({ name: 'application', params: {application_id: application_id} })
        })
        .catch(error => {
          console.error(error)
          alert(error)
        })
      } else alert('There are missing items in this application form')
    },

    delete_recipient (index) {
      this.recipients.splice(index, 1)
    },
    add_to_recipients (recipient_to_add) {

      let existing_recipient = this.recipients.find(recipient => {
        return JSON.stringify(recipient.identity) === JSON.stringify(recipient_to_add.identity)
      })

      if(existing_recipient) return alert('Duplicates not allowed')
      else this.recipients.push(recipient_to_add)

    },
    delete_group (index) {
      this.groups.splice(index, 1)
    },
    add_to_groups (group_to_add) {
      // Prevent duplicates
      this.modal_open = false
      if (!this.groups.includes(group_to_add)) {
        this.groups.push(group_to_add)
      }
      else alert('Duplicates are not allowed')
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
    },
    view_form_template(template_id){
      let routeData = this.$router.resolve({
        name: 'application_template',
        params: {template_id: template_id}
      });
      window.open(routeData.href, '_blank');
    }
  },
  computed: {
    form_valid () {
      return this.selected_form
        && this.recipients.length > 0
        && this.title
        && this.selected_form.properties
    },
    picker_api_url () {
      // TODO: THIS SHOULD NOT BE NEEDED ANYMORE
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
    }
  }
}
</script>

<style scoped>

.picker {
  height: 300px;
  margin-bottom: 1px;
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
  table-layout: fixed;
}

.form_content_table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}


.form_content_table td {
  padding: 5px;
  vertical-align: top;
}

.form_content_table td:first-child,
.application_info td:first-child{
  width: 40%;
}


.form_content_table td input{
  width: 100%;
}

.form_content_table .file_delete_button {
  font-size: 150%;
  cursor: pointer;
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
  //border: 1px solid #dddddd;
  border: none;
  outline: none;
  width: 100%;
  margin-top: 0.5em;
  resize: none;
  //resize: vertical;
  cursor: default;

}

.link_to_template {
  margin-top: 0.5em;
}

/* Application info table */
table.application_info {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}



.application_info tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.application_info td, .application_info th {
  padding: 0.5em 0;
}

table.application_info input[type="text"],
table.application_info select {
  width: 100%;
}

.group_picker_wrapper {
  height: 50vh;
  width: 75vw;
}
.visibility_group {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25em;
}

.visibility_group_picker {
  height: 100%;
}

.visibility_group:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.growing_spacer {
  flex-grow: 1;
}

.visibility_group_add_button_wrapper{
  margin-top: 0.25em;
}



.attatchment_confirm {
  margin-right: 0.5em;
}
.attachment_controls_wrapper {
  display: flex;
  align-items: center;
}
.form_template_title {
  display: flex;
  align-items: center;
}


</style>
