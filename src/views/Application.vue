<template>
  <v-card :loading="loading">
    <template v-if="application && !loading && !error">
      <v-container fluid>
        <v-row align="center">
          <v-col cols="auto">
            <v-toolbar-title v-if="application">{{
              application.title
            }}</v-toolbar-title>
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
                :disabled="application_is_fully_approved"
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
        color="red"
        dark
        class="text-center"
      >
        {{ $t("Email banner content") }}
      </v-banner>

      <!-- Application info -->
      <v-card-text>
        <v-row>
          <v-col>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t("Title") }}</v-list-item-subtitle>
                <v-list-item-title>{{ application.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>ID</v-list-item-subtitle>
                <v-list-item-title>{{
                  get_id_of_item(application)
                }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>{{ $t("Date") }}</v-list-item-subtitle>
                <v-list-item-title>
                  {{ format_date_neo4j(application.creation_date) }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>{{
                  $t("Applicant")
                }}</v-list-item-subtitle>
                <v-list-item-title>
                  <span>{{ application.applicant.display_name }}</span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- Application content, i.e. comment -->
            <v-list-item two-line>
              <v-list-item-content v-if="!application.forbidden">
                <v-list-item-subtitle>{{
                  $t("Applicant comment")
                }}</v-list-item-subtitle>
                <v-list-item-title
                  class="application_field_value"
                  v-html="
                    sanitizeHtml(
                      linkifyHtml(application.form_data[1].value || '-')
                    )
                  "
                >
                </v-list-item-title>
              </v-list-item-content>

              <v-list-item-content v-else>
                <v-list-item-subtitle>{{
                  $t("Application content")
                }}</v-list-item-subtitle>
                <v-list-item-title>{{ $t("Confidential") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-col>

          <!-- Approval flow -->
          <v-col>
            <div class="approval_flow">
              <template v-if="!!user_as_recipient && !current_recipient">
                <div class="flow_applicant">
                  <EmailButton
                    :application="application"
                    :user="application.applicant"
                    @send_email="send_email_to_applicant()"
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
                />
              </template>
            </div>

            <RecipientComments
              v-if="!application.forbidden"
              :application="application"
              @comment_updated="get_application()"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-if="!application.forbidden">
        <PdfViewer
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
import HelpDialog from "@/components/application/HelpDialog.vue";
import IdUtils from "@/mixins/IdUtils.js";
import dateUtils from "@/mixins/dateUtils.js";
import applicationUtils from "@/mixins/applicationUtils.js";
import linkifyHtml from "linkify-html";
//import * as linkify from "linkifyjs";
import * as sanitizeHtml from "sanitize-html";

import WebHankoContainer from "@/components/application/web_hanko/WebHankoContainer.vue";
import EmailButton from "@/components/application/EmailButton.vue";
import PdfViewer from "@/components/application/PdfViewer.vue";
import RecipientComments from "@/components/application/RecipientComments.vue";

export default {
  name: "Application",

  components: {
    WebHankoContainer,
    PdfViewer,
    RecipientComments,
    EmailButton,
    HelpDialog,
  },
  mixins: [IdUtils, dateUtils, applicationUtils],
  data() {
    return {
      help_dialog: false,
      application: null,
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.get_application();
  },
  beforeRouteLeave(to, from, next) {
    const email_required = this.$store.state.email_required;
    if (email_required) {
      if (confirm(`メール未送信なのにページから出ますか？`)) {
        this.$store.commit("require_email", false);
        next();
      }
    } else next();
  },
  methods: {
    get_application() {
      this.loading = true;
      this.application = null;
      this.error = null;
      const url = `/applications/${this.application_id}`;

      this.axios
        .get(url)
        .then(({ data }) => {
          this.application = data;
          if (!this.application.forbidden) {
            this.application.form_data = JSON.parse(this.application.form_data);
          }
        })
        .catch((error) => {
          if (error.response) {
            console.error(error.response.data);
            if (error.response.status === 404) {
              this.error = `アイテム${this.application_id}見つけれませんでした
              Item ${this.application_id} not found`;
            }
            console.log(error.response.status);
          } else {
            console.error(error);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    reject_application() {
      const confirm_message = this.$t("Reject application");
      if (!confirm(confirm_message)) return;

      const url = `/applications/${this.application_id}/reject`;

      this.axios
        .post(url)
        .then(() => {
          this.get_application();
        })
        .catch((error) => {
          console.error(error);
          alert(`Error approving application`);
        });
    },
    delete_application() {
      const confirm_message = this.$t("Delete this application form");
      if (!confirm(confirm_message)) return;
      const url = `/applications/${this.application_id}`;
      this.axios
        .delete(url)
        .then(() => {
          this.$router.push({ name: "submitted_applications" });
        })
        .catch((error) => {
          if (error.response) console.error(error.response.data);
          else console.error(error);
        });
    },
    linkifyHtml,
    sanitizeHtml,
  },
  computed: {
    application_id() {
      return this.$route.params.application_id;
    },
    ordered_recipients() {
      return this.application.recipients
        .slice()
        .sort((a, b) => b.submission.flow_index - a.submission.flow_index);
    },
    current_recipient() {
      // recipients sorted by flow index apparently
      if (this.application.recipients.find((recipient) => recipient.refusal))
        return null;

      return this.application.recipients
        .slice()
        .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
        .find((recipient) => !recipient.approval && !recipient.refusal);
    },
    application_is_rejected() {
      return !!this.application.recipients.find(
        (recipient) => recipient.refusal
      );
    },
    application_is_fully_approved() {
      const recipient_count = this.application.recipients.length;
      const approval_count = this.application.recipients.reduce(
        (acc, recipient) => acc + (recipient.approval ? 1 : 0),
        0
      );
      return approval_count === recipient_count;
    },
  },
};
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

.application_field_value {
  white-space: pre-line;
}
</style>
