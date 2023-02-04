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
          {{ application.applicant.display_name }}
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <!-- Privacy -->
      <!-- TODO: Make its own component -->
      <v-list-item>
        <v-list-item-content>
          {{ $t("Confidential") }}
        </v-list-item-content>
        <v-list-item-content class="align-end">
          <v-switch
            :disabled="!user_is_applicant"
            v-model="application.private"
            @change="update_privacy_of_application()"
          />
        </v-list-item-content>
      </v-list-item>

      <template v-if="application.private">
        <v-divider />
        <v-list-item>
          <v-list-item-content>{{ $t("Visibility") }}</v-list-item-content>
          <v-list-item-content class="align-end">
            <v-row>
              <v-col cols="auto">
                <v-chip>{{ $t("Approval flow") }}</v-chip>
              </v-col>
              <v-col
                cols="auto"
                v-for="(group, index) in application.visibility"
                :key="`group_${index}`"
              >
                <v-chip>
                  <v-chip
                    :close="user_is_applicant"
                    @click:close="remove_application_visibility_to_group(group)"
                  >
                    {{ group.name }}
                  </v-chip>
                </v-chip>
              </v-col>
              <v-col cols="auto">
                <AddGroupDialog @selection="share_with_group($event)" />
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </template>
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
import AddGroupDialog from "@/components/AddGroupDialog.vue"

export default {
  components: {
    AddGroupDialog,
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
    format_date_neo4j(date) {
      // TODO: Would be better to use a mixin
      return `${date.year}/${date.month}/${date.day}`
    },
    update_privacy_of_application() {
      const url = `/v2/applications/${this.application_id}/privacy`
      const body = { private: this.application.private }
      this.axios
        .put(url, body)
        .then(() => {})
        .catch(() => alert("Error updating privacy of application"))
    },
    share_with_group(group) {
      const url = `/v2/applications/${this.application_id}/privacy/groups`
      const body = { group_id: this.get_id_of_item(group) }
      this.axios
        .post(url, body)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          alert("Error updating visibility of application")
          console.error(error)
        })
    },
    remove_application_visibility_to_group(group) {
      const url = `/v2/applications/${
        this.application_id
      }/privacy/groups/${this.get_id_of_item(group)}`
      this.axios
        .delete(url)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          console.error(error)
          alert("Error updating visibility of application")
        })
    },
    download_attachment(file_id) {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${this.application_id}/files/${file_id}`
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
