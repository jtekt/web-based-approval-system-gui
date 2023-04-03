<template>
  <v-card :loading="loading">
    <template v-if="application && !error">
      <v-container fluid>
        <v-row align="center">
          <v-col cols="auto">
            <v-toolbar-title v-if="application">
              {{ application.title }}
            </v-toolbar-title>
            <v-toolbar-title v-else>{{ $t("Application") }}</v-toolbar-title>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <HelpDialog />
          </v-col>
          <template v-if="user_is_applicant">
            <v-col cols="auto">
              <v-btn
                text
                @click="
                  $router.push({
                    name: 'new_application',
                    query: { copy_of: get_id_of_item(application) },
                  })
                "
              >
                <v-icon left>mdi-restore</v-icon>
                <span>{{ $t("Re-submit") }}</span>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                text
                :disabled="
                  application_is_fully_approved && !current_user_is_admin
                "
                color="#c00000"
                @click="delete_application()"
              >
                <v-icon left>mdi-delete</v-icon>
                <span>{{ $t("Delete") }}</span>
              </v-btn>
            </v-col>
          </template>
        </v-row>
      </v-container>
      <v-divider />

      <v-banner
        v-if="this.$store.state.email_required"
        single-line
        class="text-center red--text"
      >
        {{
          $t(
            "Click the email icon of the next recipient to send a notification email"
          )
        }}
      </v-banner>

      <v-container fluid>
        <v-row>
          <!-- Left column: Application form data -->
          <v-col cols="6">
            <ApplicationFormContent
              v-model="application"
              @pdfSelected="view_pdf($event)"
            />
          </v-col>

          <!-- Application approval controls -->
          <!-- TODO: make its own component, be careful with approval using pdf reader -->
          <v-col>
            <v-row v-if="current_recipient_is_current_user" class="mb-3">
              <v-spacer />

              <v-col cols="auto">
                <v-btn color="#00c000" dark @click="approve_application()">
                  <v-icon left>mdi-check</v-icon>
                  <span>{{ $t("Approve") }}</span>
                </v-btn>
              </v-col>

              <v-col cols="auto">
                <v-btn color="#c00000" dark @click="reject_application()">
                  <v-icon left>mdi-close</v-icon>
                  <span>{{ $t("Reject") }}</span>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Approval flow -->
            <!-- TODO: make a component -->
            <div class="approval_flow">
              <template v-if="!!user_as_recipient && !current_recipient">
                <div class="flow_applicant">
                  <EmailButton
                    :application="application"
                    :user="application.applicant"
                  />
                </div>

                <div>
                  <v-icon class="mt-16">mdi-arrow-left</v-icon>
                </div>
              </template>

              <template v-for="(recipient, index) in ordered_recipients">
                <div v-if="index > 0" :key="`flow_arrow_${index}`">
                  <v-icon class="mt-16">mdi-arrow-left</v-icon>
                </div>

                <WebHankoContainer
                  :key="`recipient_${index}`"
                  :recipient="recipient"
                  :application="application"
                  @reject="reject_application()"
                />
              </template>
            </div>

            <RecipientComments
              :application="application"
              @comment_updated="get_application()"
            />
          </v-col>
        </v-row>
      </v-container>

      <v-card-text>
        <PdfViewer
          v-if="selected_file_id"
          :selected_file_id="selected_file_id"
          :application="application"
          @pdf_stamped="get_application()"
          @reject="reject_application()"
        />
      </v-card-text>
    </template>

    <v-card-text
      v-if="error"
      style="white-space: pre-line; color: #c00000"
      class="text-center text-h6"
    >
      {{ error }}
    </v-card-text>
  </v-card>
</template>

<script>
import IdUtils from "@/mixins/IdUtils.js"

import HelpDialog from "@/components/application/HelpDialog.vue"
import WebHankoContainer from "@/components/application/web_hanko/WebHankoContainer.vue"
import EmailButton from "@/components/application/EmailButton.vue"
import PdfViewer from "@/components/application/PdfViewer.vue"
import RecipientComments from "@/components/application/RecipientComments.vue"
import ApplicationFormContent from "../components/application/ApplicationFormContent.vue"

export default {
  name: "Application",

  components: {
    ApplicationFormContent,
    WebHankoContainer,
    PdfViewer,
    RecipientComments,
    EmailButton,
    HelpDialog,
  },
  mixins: [IdUtils],
  data() {
    return {
      help_dialog: false,
      application: null,
      loading: false,
      error: null,
      selected_file_id: null,
    }
  },
  mounted() {
    this.get_application()
  },
  beforeRouteLeave(to, from, next) {
    const email_required = this.$store.state.email_required
    if (email_required) {
      if (confirm(`メール未送信なのにページから出ますか？`)) {
        this.$store.commit("require_email", false)
        next()
      }
    } else next()
  },
  methods: {
    get_application() {
      this.loading = true
      this.application = null
      this.error = null
      const url = `/applications/${this.application_id}`
      this.axios
        .get(url)
        .then(({ data }) => {
          this.application = data

          // parsing form_data back into JSON because Neo4J cannot store JSON directly
          if (!this.application.form_data) return
          this.application.form_data = JSON.parse(this.application.form_data)
        })
        .catch((error) => {
          if (error.response) {
            console.error(error.response.data)
            if (error.response.status === 404) {
              this.error = `アイテム${this.application_id}見つけれませんでした
            Item ${this.application_id} not found`
            }
          } else {
            console.error(error)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    view_pdf(file_id) {
      this.selected_file_id = file_id
    },
    approve_application() {
      if (!confirm(this.$t("Approve application"))) return
      const url = `/applications/${this.application_id}/approve`
      this.axios
        .post(url)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          console.error(error)
          alert(`Error approving application`)
        })
    },
    reject_application() {
      if (!confirm(this.$t("Reject application"))) return
      const url = `/applications/${this.application_id}/reject`

      this.axios
        .post(url)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          console.error(error)
          alert(`Error rejecting application`)
        })
    },
    delete_application() {
      if (!confirm(this.$t("Delete this application form"))) return
      const url = `/applications/${this.application_id}`
      this.axios
        .delete(url)
        .then(() => {
          this.$router.push({ name: "submitted_applications" })
        })
        .catch((error) => {
          if (error.response) console.error(error.response.data)
          else console.error(error)
        })
    },
  },
  computed: {
    application_id() {
      return this.$route.params.application_id
    },
    ordered_recipients() {
      return this.application.recipients
        .slice()
        .sort((a, b) => b.submission.flow_index - a.submission.flow_index)
    },
    current_recipient() {
      // recipients sorted by flow index apparently
      if (this.application.recipients.find((recipient) => recipient.refusal))
        return null

      return this.application.recipients
        .slice()
        .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
        .find((recipient) => !recipient.approval && !recipient.refusal)
    },
    user_as_recipient() {
      return this.application.recipients.find(
        (recipient) => this.get_id_of_item(recipient) === this.current_user_id
      )
    },
    application_is_rejected() {
      return !!this.application.recipients.find(
        (recipient) => recipient.refusal
      )
    },
    application_is_fully_approved() {
      const recipient_count = this.application.recipients.length
      const approval_count = this.application.recipients.reduce(
        (acc, recipient) => acc + (recipient.approval ? 1 : 0),
        0
      )
      return approval_count === recipient_count
    },
    user_is_applicant() {
      return (
        this.get_id_of_item(this.application.applicant) === this.current_user_id
      )
    },
    current_recipient_is_current_user() {
      if (!this.current_recipient) return false
      const current_recipient_id = this.get_id_of_item(this.current_recipient)
      return current_recipient_id === this.current_user_id
    },
    approvals() {
      return this.application.recipients
        .filter((a) => !!a.approval)
        .map((r) => r.approval)
    },
    current_user_is_admin() {
      return (
        this.$store.state.current_user.isAdmin ||
        this.$store.state.properties?.isAdmin
      )
    },
  },
}
</script>

<style>
.approval_flow {
  /* horizontal layout */
  display: flex;
  justify-content: flex-end;
  /* because wrap reverse */
  align-items: flex-end;
  flex-wrap: wrap-reverse;
}

.comments {
  margin-top: 3em;
}

.flow_applicant {
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}
</style>
