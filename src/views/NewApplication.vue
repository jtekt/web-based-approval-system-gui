<template>
  <v-card>
    <v-card-title class="text-h5">
      新規作成 / New submission
    </v-card-title>

    <v-card-subtitle class="mt-2 text-h6">
      ① 申請内容 / Application content
    </v-card-subtitle>

    <v-card-text>

      <v-row>
        <v-col>
          <v-select
            :items="application_form_templates"
            item-text="properties.label"
            return-object
            v-model="selected_form"
            label="Template"/>
        </v-col>
      </v-row>


      <v-row>
        <v-col>
          <v-text-field
            v-model="title"
            label="件名 / Application title"/>
        </v-col>
      </v-row>

      <v-row align="center">
        <v-col cols="auto">
          <v-switch
            v-model="confidential"
            :label="`Confidential`"/>
        </v-col>
        <template v-if="confidential">

          <v-col cols="auto">
            <v-chip>Approval flow</v-chip>
          </v-col>
          <v-col cols="auto">
            <v-chip
              close
              v-for="(group, index) in groups"
              :key="`group_${index}`"
              @click:close="remove_group(index)">
              {{group.properties.name}}
            </v-chip>
          </v-col>
          <v-col cols="auto">
            <AddGroupDialog
              @selection="add_group($event)"/>
          </v-col>
        </template>

      </v-row>

      <template v-if="selected_form">

        <v-card outlined>

          <v-card-title>{{selected_form.properties.label}}</v-card-title>

          <v-card-text>
            <v-row
              v-for="(field, index) in selected_form.properties.fields"
              :key="`field_${index}`">

              <v-col>

                <template v-if="['file','pdf'].includes(field.type)">

                  <v-chip
                    v-if="field.value"
                    close
                    label
                    @click:close="field.value = null">
                    アップロード完了 / Upload OK
                  </v-chip>

                <v-file-input
                  v-else
                  @change="file_upload($event, field)"
                  :label="field.label"/>

                </template>

                <v-checkbox
                  v-else-if="field.type === 'checkbox'"
                  v-model="field.value"
                  :label="field.label"/>

                <DatePicker
                  v-else-if="field.type === 'date'"
                  :label="field.label"
                  v-model="field.value"/>

                <v-textarea
                  v-else-if="field.type === 'text'"
                  rows="1"
                  auto-grow
                  :label="field.label"
                  v-model="field.value"/>

                <v-text-field
                  v-else
                  v-model="field.value"
                  :label="field.label"/>

              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>






    </v-card-text>

    <v-card-subtitle class="mt-2 text-h6">
      <span>② 承認フロー / Approval flow</span>
    </v-card-subtitle>

    <v-card-text >
      <NewApplicationApprovalFlow
        v-if="this.recipients.length > 0"
        :recipients="recipients" />

        <v-dialog
          v-model="add_recipient_dialog"
          width="900">

          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="#c00000"
              dark
              v-bind="attrs"
              v-on="on">
              <v-icon>mdi-account-plus</v-icon>
              <span>承認者追加 / Add recipient</span>

            </v-btn>
          </template>


          <v-card>
            <v-card-title class="text-h5">
              承認者追加 / Add recipient
            </v-card-title>

            <v-card-text>
              <UserPicker
                class="user_picker"
                v-on:selection="add_to_recipients($event)"/>
            </v-card-text>

            <v-card-text v-if="recipients.length > 0">
              <NewApplicationApprovalFlow
                :recipients="recipients"/>
            </v-card-text>

            <v-card-text v-else>
              承認者が選ばれていません / No recipient selected
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                color="#c00000"
                text
                @click="add_recipient_dialog = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
    </v-card-text>




    <v-card-subtitle class="mt-2 text-h6">
      ③ 承認手続き / Submission
    </v-card-subtitle>

    <v-card-text>
      <v-btn
        color="#c00000"
        :dark="application_valid"
        @click="submit()"
        :disabled="!application_valid">
        <v-icon>mdi-send</v-icon>
        <span>次へ / Submit</span>

      </v-btn>
    </v-card-text>







  </v-card>
</template>

<script>
import UserPicker from '@moreillon/vue_user_picker'
import NewApplicationApprovalFlow from '@/components/NewApplicationApprovalFlow.vue'
import IdUtils from '@/mixins/IdUtils.js'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import DatePicker from '@/components/DatePicker.vue'

export default {
  name: 'NewApplication',
  mixins: [
    IdUtils
  ],
  data(){
    return {
      application_form_templates: [],
      templates_loading: false,
      selected_form: null, // when null, recreation throws errors


      title: '',
      confidential: false,
      recipients: [],
      add_recipient_dialog: false,
      file_uploading: false,

      groups: [], // Groups for visibility

      submitting: false,


    }
  },

  components: {
    UserPicker,
    NewApplicationApprovalFlow,
    AddGroupDialog,
    DatePicker,
  },
  mounted () {
    this.get_templates()
    if (this.$route.query.copy_of) this.recreate_application_content()
  },
  methods: {
    get_templates () {
      this.templates_loading = true
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates`
      this.axios.get(url)
      .then( ({data}) => { this.application_form_templates = data })
      .catch(error => {
        console.error(error)
      })
      .finally(() => { this.templates_loading = false})
    },
    submit(){

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications`

      const recipients_ids = this.recipients.map( ({properties: {_id}}) => _id)
      const group_ids = this.groups.map( ({properties: {_id}}) => _id)


      const body = {
        title: this.title,
        type: this.selected_form.properties.label,
        form_data: this.selected_form.properties.fields,
        private: this.confidential,
        recipients_ids,
        group_ids,
      }


      this.axios.post(url, body)
      .then(({ data }) => {
        this.$store.commit('require_email', true)
        const application_id = this.get_id_of_item(data)
        this.$router.push({ name: 'application', params: { application_id } })
      })
      .catch(error => {
        console.error(error)
        alert(error)
        this.submitting = false
      })
    },
    file_upload(file, field){
      this.file_uploading = true
      let formData = new FormData()
      formData.append('file_to_upload', file)
      // there is a better way to set headers!
      this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(({data}) => {
        this.$set(field, 'value', data)
       })
      .catch(error => alert(error.response.data))
      .finally(() => { this.file_uploading = false })
    },
    add_to_recipients(new_recipient) {
      const existing_recipient = this.recipients.find(recipient => this.get_id_of_item(recipient) === this.get_id_of_item(new_recipient))
      if (existing_recipient) return alert('Duplicates not allowed')
      this.recipients.push(new_recipient)
    },
    delete_recipient(recipient_index) {
      this.recipients.splice(recipient_index,1)
    },
    recreate_application_content () {
      // This function is called when the application is a dubplicate of an existing one

      // NOTE: NO CONFIDENTIALITY FOR NOW!

      // alert(`再申請機能はまだできてません`)

      const application_id = this.$route.query.copy_of
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications/${application_id}`
      this.axios.get(url)
      .then(({data}) => {


        const original_application = data


        // Set application details back
        this.title = original_application.properties.title
        this.confidential = original_application.properties.private


        original_application.properties.form_data = JSON.parse(original_application.properties.form_data)
        this.form_data = original_application.properties.form_data

        this.selected_form = {}
        this.$set(this.selected_form, 'properties', {
          label: original_application.properties.type, // The application form label (type)
          fields: original_application.properties.form_data // The fields of the application
        })

        this.groups = original_application.visibility



        // Recreate flow
        this.recipients = original_application.recipients.sort((a, b) => {
          return a.submission.properties.flow_index - b.submission.properties.flow_index
        })

      })
      .catch((error) => {
        console.error(error)
      })
    },
    add_group (group_to_add) {
      if (!this.groups.includes(group_to_add)) {
        this.groups.push(group_to_add)
      }
      else alert('Duplicates are not allowed')
    },
    remove_group(index){
      this.groups.splice(index, 1)
    },
  },
  computed: {
    application_valid(){
      return this.title !== ''
        && this.recipients.length > 0
        && !!this.selected_form.properties
    }
  }
}
</script>

<style>
.user_picker {
  max-height: 300px;
}
</style>
