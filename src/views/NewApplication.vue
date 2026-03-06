<template>
  <v-card>
    <v-card-title class="text-h4">
      {{ $t("New submission") }}
    </v-card-title>

    <v-card-text>
      <v-card outlined>
        <v-toolbar flat>
          <v-card-title class="mt-2 text-h6">
            {{ $t("Application content") }}
          </v-card-title>
        </v-toolbar>

        <v-card-text>
          <v-row v-if="$route.query.copy_of" align="center">
            <v-col cols="auto">
              {{ $t("Resubmission of") }} {{ $route.query.copy_of }}
            </v-col>
            <v-col cols="auto">
              <v-btn outlined small exact :to="{ name: 'new_application' }">
                {{ $t("Start from scratch") }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Form data -->
          <v-row>
            <v-col>
              <v-text-field v-model="title" :label="$t('Title')" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <FileUpload
                v-model="form_data[0].value"
                accept="application/pdf"
                :label="$t('pdf file')"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                auto-grow
                rows="1"
                v-model="form_data[1].value"
                :label="$t('Applicant comment')"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-text>
      <v-card outlined>
        <v-toolbar flat>
          <v-row align="center">
            <v-col cols="auto">
              <v-card-subtitle class="mt-2 text-h6">
                {{ $t("Approval flow") }}
              </v-card-subtitle>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <!-- Add recipient dialog, ideally make it a component -->
              <v-dialog v-model="add_recipient_dialog" width="900">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="#c00000" dark v-bind="attrs" v-on="on">
                    <v-icon left>mdi-account-plus</v-icon>
                    <span>{{ $t("Add recipient") }}</span>
                  </v-btn>
                </template>

                <v-card>
                  <v-card-title class="text-h5">
                    {{ $t("Add recipient") }}
                  </v-card-title>

                  <v-card-text>
                    <UserPicker
                      class="user_picker"
                      v-on:selection="add_to_recipients($event)"
                      :accessToken="user_picker_token"
                    />
                  </v-card-text>

                  <v-card-text v-if="recipients.length">
                    <NewApplicationApprovalFlow :recipients="recipients" />
                  </v-card-text>

                  <v-card-text v-else>
                    {{ $t("No recipient selected") }}
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      color="#c00000"
                      text
                      @click="add_recipient_dialog = false"
                    >
                      Close
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="auto">
              <v-btn outlined @click="saveRecipients">
                <v-icon left>mdi-content-save</v-icon>
                <span>Save</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-toolbar>

        <v-card-text v-if="this.recipients.length > 0">
          <NewApplicationApprovalFlow :recipients="recipients" />
        </v-card-text>
        <v-card-text v-else>
          {{ $t("Please select the recipients of this application") }}
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-text>
      <v-card outlined>
        <v-toolbar flat>
          <v-card-subtitle class="mt-2 text-h6">
            {{ $t("Submission") }}
          </v-card-subtitle>
        </v-toolbar>

        <v-card-text class="text-center">
          <v-btn
            :loading="submitting"
            color="#c00000"
            :dark="application_valid"
            @click="submit()"
            :disabled="!application_valid"
          >
            <v-icon left>mdi-send</v-icon>
            <span>{{ $t("Submit application") }}</span>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
import UserPicker from "@moreillon/vue_user_picker"
import NewApplicationApprovalFlow from "@/components/new_application/NewApplicationApprovalFlow.vue"
import FileUpload from "@/components/new_application/FileUpload.vue"
import IdUtils from "@/mixins/IdUtils.js"
import { localStorageRecipientsKey } from "@/constants"

export default {
  name: "NewApplication",
  mixins: [IdUtils],
  data() {
    return {
      title: "",
      form_data: [
        { type: "pdf", label: "file", value: null },
        { type: "text", label: "memo", value: "" },
      ],
      recipients: this.getRecipientsFromLocalStorage(),
      add_recipient_dialog: false,
      file_uploading: false,
      submitting: false,
    }
  },

  components: {
    UserPicker,
    NewApplicationApprovalFlow,
    FileUpload,
  },
  mounted() {
    if (this.$route.query.copy_of) this.recreate_application_content()
  },
  watch: {
    copy_of() {
      if (!this.$route.query.copy_of) {
        this.title = ""
        this.recipients = this.getRecipientsFromLocalStorage()
        this.form_data = [
          { type: "pdf", label: "file", value: null },
          { type: "text", label: "memo", value: "" },
        ]
      }
    },
  },

  methods: {
    submit() {
      this.submitting = true

      const body = {
        title: this.title,
        type: "PDF",
        form_data: this.form_data,
        recipients_ids: this.recipients.map((recipient) =>
          this.get_id_of_item(recipient)
        ),
        private: true, // A bit dangerous
      }

      this.axios
        .post(`/applications`, body)
        .then(({ data }) => {
          this.$store.commit("require_email", true)
          const application_id = this.get_id_of_item(data)
          this.$router.push({ name: "application", params: { application_id } })
        })
        .catch((error) => {
          console.error(error)
          alert(error)
        })
        .finally(() => {
          this.submitting = false
        })
    },
    file_upload(file) {
      this.file_uploading = true
      let formData = new FormData()
      formData.append("file_to_upload", file)
      this.axios
        .post(`/files`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(({ data }) => {
          this.form_data[0].value = data.file_id
        })
        .catch((error) => alert(error.response.data))
        .finally(() => {
          this.file_uploading = false
        })
    },
    add_to_recipients(new_recipient) {
      const existing_recipient = this.recipients.find(
        (recipient) =>
          this.get_id_of_item(recipient) === this.get_id_of_item(new_recipient)
      )
      if (existing_recipient) return alert("Duplicates not allowed")
      this.recipients.push(new_recipient)
    },
    delete_recipient(recipient_index) {
      this.recipients.splice(recipient_index, 1)
    },
    recreate_application_content() {
      // This function is called when the application is a dubplicate of an existing one

      const application_id = this.$route.query.copy_of
      this.axios
        .get(`/applications/${application_id}`)
        .then(({ data: original_application }) => {
          const {
            title,
            private: confidential, // renaming becuase private is reserved
            form_data,
            recipients,
          } = original_application

          // Set application details back
          this.title = title
          this.confidential = confidential
          this.form_data = JSON.parse(form_data)

          // Recreate flow
          this.recipients = recipients.sort(
            (a, b) => a.submission.flow_index - b.submission.flow_index
          )
        })
        .catch((error) => {
          console.error(error)
        })
    },
    saveRecipients() {
      localStorage.setItem(
        localStorageRecipientsKey,
        JSON.stringify(this.recipients)
      )
      alert("承認フローが保存されました")
    },
    getRecipientsFromLocalStorage() {
      const localStorageItem = localStorage.getItem(localStorageRecipientsKey)
      if (!localStorageItem) return []
      return JSON.parse(localStorageItem)
    },
  },
  computed: {
    application_valid() {
      return (
        this.title !== "" &&
        this.form_data[0].value &&
        this.recipients.length > 0
      )
    },
    copy_of() {
      return this.$route.query.copy_of
    },
  },
}
</script>

<style>
.user_picker {
  max-height: 300px;
}
</style>
