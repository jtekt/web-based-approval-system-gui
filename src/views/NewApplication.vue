<template>
  <v-card>
    <v-card-title class="text-h4">
      新規作成 / New submission
    </v-card-title>

    <!-- Application form metadata -->
    <v-card-text>
      <v-card outlined>

        <v-toolbar flat>
          <v-card-title class="mt-2 text-h6">
            ① 申請情報 / Application info
          </v-card-title>
        </v-toolbar>



        <v-card-text>

          <v-row>
            <v-col>
              <v-select
                :items="application_form_templates"
                item-text="properties.label"
                return-object
                v-model="selected_form"
                label="申請種類 / Application type"/>
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
              機密 / Confidential
            </v-col>
            <v-col cols="auto">
              <v-switch v-model="confidential"/>
            </v-col>
          </v-row>

          <v-row
            align="baseline"
            v-if="confidential">
            <v-col cols="auto">
              共有 / Visibility
            </v-col>
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
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>

    <!-- Application content -->
    <v-card-text>

      <v-card outlined>

        <v-toolbar flat>
          <v-card-title>
            ② 申請内容 / Application content: {{selected_form ? selected_form.properties.label : null}}
          </v-card-title>
        </v-toolbar>



        <v-card-text v-if="!selected_form">
          申請種類を選択してください / Please select an application type
        </v-card-text>

        <template v-if="selected_form">

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
                  :accept="field.type === 'pdf' ? 'application/pdf' : ''"
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
        </template>


      </v-card>
    </v-card-text>


    <v-card-text>
      <v-card outlined>
        <v-toolbar flat>
          <v-row
            align="center">
            <v-col cols="auto">
              <v-card-subtitle class="mt-2 text-h6">
                ③ 承認フロー / Approval flow
              </v-card-subtitle>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <!-- Add recipient dialog, ideally make it a component -->
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
            </v-col>
          </v-row>
        </v-toolbar>


        <v-card-text v-if="this.recipients.length > 0">
          <NewApplicationApprovalFlow

            :recipients="recipients" />
        </v-card-text>
        <v-card-text v-else>承認者を追加してください / Please select the recipients of this application</v-card-text>
      </v-card>
    </v-card-text>


    <v-card-text>
      <v-card outlined>

        <v-toolbar flat>
          <v-card-subtitle class="mt-2 text-h6">
            ④ 承認手続き / Submission
          </v-card-subtitle>
        </v-toolbar>


        <v-card-text class="text-center">
          <v-btn
            :loading="submitting"
            color="#c00000"
            :dark="application_valid"
            @click="submit()"
            :disabled="!application_valid">
            <v-icon>mdi-send</v-icon>
            <span>申請書を提出する / Submit application</span>

          </v-btn>
        </v-card-text>
      </v-card>
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

      this.submitting = true

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications`

      const recipients_ids = this.recipients.map( (recipient) => recipient._id || recipient.properties._id)
      const group_ids = this.groups.map( (group) => group._id || group.properties._id)


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
