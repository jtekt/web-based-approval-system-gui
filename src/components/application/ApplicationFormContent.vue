<template>
  <div>
    <div class="text-h6">{{ $t("Application info") }}</div>

    <v-list dense>
      <v-divider />
      <v-list-item>
        <v-list-item-content> ID </v-list-item-content>
        <v-list-item-content class="align-end">
          {{ get_id_of_item(application) }}
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list-item>
        <v-list-item-content>
          {{ $t("Title") }}
        </v-list-item-content>
        <v-list-item-content class="align-end">
          {{ application.title }}
        </v-list-item-content>
      </v-list-item>

      <v-divider />
      <v-list-item>
        <v-list-item-content>
          {{ $t("Type") }}
        </v-list-item-content>
        <v-list-item-content class="align-end">
          {{ application.type }}
        </v-list-item-content>
      </v-list-item>

      <v-divider />
      <v-list-item>
        <v-list-item-content>
          {{ $t("Date") }}
        </v-list-item-content>
        <v-list-item-content class="align-end">
          {{ format_date_neo4j(application.creation_date) }}
        </v-list-item-content>
      </v-list-item>

      <v-divider />
      <v-list-item>
        <v-list-item-content>
          {{ $t("Applicant") }}
        </v-list-item-content>
        <v-list-item-content class="align-end">
          <UserChip :user="application.applicant" />
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <PrivacySettings v-model="application" />
    </v-list>

    <!-- application form data, i.e. content  -->
    <div class="text-h6">{{ $t("Application content") }}</div>

    <v-list dense v-if="application.forbidden">
      <v-list-item>
        <v-list-item-content class="red--text">
          {{ $t("Confidential") }}
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-list dense v-else>
      <template v-for="(field, index) in application.form_data">
        <v-divider :key="`field_${index}_divider`" />

        <v-list-item :key="`field_${index}_item`">
          <v-list-item-content>{{ field.label }}</v-list-item-content>

          <v-list-item-content class="align-end" v-if="field.type === 'pdf'">
            <template v-if="field.value">
              <template v-if="user_as_recipient">
                <div
                  class="green--text text-center mb-2"
                  v-if="user_has_stamped_attachment(field.value)"
                >
                  {{ $t("Stamped") }}
                </div>

                <div class="red--text text-center mb-2" v-else>
                  {{ $t("Not stamped yet") }}
                </div>
              </template>

              <v-btn @click="$emit('pdfSelected', field.value)" block>
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
          </v-list-item-content>

          <v-list-item-content
            class="align-end"
            v-else-if="field.type === 'file'"
          >
            <v-btn
              v-if="field.value"
              @click="download_attachment(field.value)"
              block
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </v-list-item-content>

          <v-list-item-content
            class="align-end"
            v-else-if="field.type === 'checkbox'"
          >
            {{ field.value ? "✓" : "✕" }}
          </v-list-item-content>

          <v-list-item-content
            class="align-end"
            v-else-if="field.type === 'link'"
          >
            <a :href="field.value" target="_blank">
              {{ field.value }}
            </a>
          </v-list-item-content>

          <v-list-item-content
            class="align-end"
            v-else-if="field.type === 'application'"
          >
            <a
              class="field_link"
              :href="`/applications/${field.value}`"
              target="_blank"
            >
              {{ field.value }}
            </a>
          </v-list-item-content>

          <v-list-item-content class="align-end application_field_value" v-else>
            {{ field.value || "-" }}
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<script>
import IdUtils from "@/mixins/IdUtils.js"
import PrivacySettings from "@/components/application/PrivacySettings.vue"
import UserChip from "../UserChip.vue"

const { VUE_APP_SHINSEI_MANAGER_URL } = process.env

export default {
  components: {
    PrivacySettings,
    UserChip,
  },
  props: {
    value: Object,
  },
  mixins: [IdUtils],

  data() {
    return {
      application: this.value,
    }
  },
  watch: {
    application: {
      deep: true,
      handler() {
        this.$emit("update", this.application)
      },
    },
  },
  methods: {
    format_date_neo4j({ year, month, day }) {
      // TODO: Would be better to use a mixin
      return `${year}/${month}/${day}`
    },

    download_attachment(file_id) {
      const url = `${VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/files/${file_id}`
      window.open(url, "_blank")
    },
    user_has_stamped_attachment(file_id) {
      if (!this.user_as_recipient) return false

      const found_approval = this.user_as_recipient.approval

      if (!found_approval) return

      let attachment_hankos = found_approval.attachment_hankos

      if (typeof attachment_hankos === "string") {
        try {
          attachment_hankos = JSON.parse(attachment_hankos)
        } catch (e) {
          console.error("Failed to parse attachment hankos")
        }
      }

      if (!attachment_hankos) return

      return !!attachment_hankos.find((a) => a.file_id === file_id)
    },
  },
  computed: {
    application_id() {
      return this.$route.params.application_id
    },
    user_as_recipient() {
      return this.application.recipients.find(
        (recipient) => this.get_id_of_item(recipient) === this.current_user_id
      )
    },

    user_is_applicant() {
      return (
        this.get_id_of_item(this.application.applicant) === this.current_user_id
      )
    },
  },
}
</script>

<style scoped>
.application_field_value {
  white-space: pre-line;
}
</style>
