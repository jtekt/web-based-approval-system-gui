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
          <v-text-field
            v-model="title"
            label="件名 / Application title"/>
        </v-col>
      </v-row>
      <v-row>
        <v-col>

          <v-progress-linear
            v-if="file_uploading"
            indeterminate/>

          <v-chip
            v-else-if="form_data[0].value"
            close
            label
            @click:close="form_data[0].value = null">
            アップロード完了 / Upload OK
          </v-chip>

          <v-file-input
            v-else
            @change="file_upload($event)"
            accept="application/pdf"
            label=".pdf ファイル / .pdf file"/>

        </v-col>

      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="form_data[1].value"
            label="メモ / Comment"/>
        </v-col>
      </v-row>
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
              <v-spacer></v-spacer>
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

export default {
  name: 'NewApplication',
  data(){
    return {
      title: '',
      form_data: [
        {type: 'pdf', label: 'file', value: null},
        {type: 'text', label: 'memo', value: ''},
      ],
      recipients: [],
      add_recipient_dialog: false,
      file_uploading: false,


    }
  },

  components: {
    UserPicker,
    NewApplicationApprovalFlow,
  },
  mounted () {
    if (this.$route.query.copy_of) this.recreate_application_content()
  },
  methods: {
    submit(){

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications`

      const body = {
        title: this.title,
        type: 'PDF',
        form_data: this.form_data,
        recipients_ids: this.recipients.map( recipient => recipient.identity),
        private: true, // A bit dangerous
      }


      this.axios.post(url, body)
      .then(({ data }) => {
        this.$router.push({ name: 'application', params: { application_id: data.identity } })
      })
      .catch(error => {
        console.error(error)
        alert(error)
        this.submitting = false
      })
    },
    file_upload(file){
      this.file_uploading = true
      let formData = new FormData()
      formData.append('file_to_upload', file)
      this.axios.post(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(({data}) => {
        this.form_data[0].value = data
       })
      .catch(error => alert(error.response.data))
      .finally(() => { this.file_uploading = false })
    },
    add_to_recipients(new_recipient) {
      const existing_recipient = this.recipients.find(recipient => recipient.identity === new_recipient.identity)
      if (existing_recipient) return alert('Duplicates not allowed')
      this.recipients.push(new_recipient)
    },
    delete_recipient(recipient_index) {
      this.recipients.splice(recipient_index,1)
    },
    recreate_application_content () {
      // This function is called when the application is a dubplicate of an existing one

      // NOTE: NO CONFIDENTIALITY FOR NOW!

      const application_id = this.$route.query.copy_of
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${application_id}`
      this.axios.get(url)
      .then(({data}) => {


        const original_application = data

        // Set application details back
        this.title = original_application.properties.title
        this.confidential = original_application.properties.private

        original_application.properties.form_data = JSON.parse(original_application.properties.form_data)
        this.form_data = original_application.properties.form_data


        // Recreate flow
        this.recipients = original_application.recipients.sort((a, b) => {
          return a.submission.properties.flow_index - b.submission.properties.flow_index
        })

      })
      .catch((error) => {
        console.error(error)
      })
    },
  },
  computed: {
    application_valid(){
      return this.title !== '' && this.form_data[0].value && this.recipients.length > 0
    }
  }
}
</script>

<style>
.user_picker {
  max-height: 300px;
}
</style>
