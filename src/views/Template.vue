<template>
  <v-card :loading="loading">
    <v-toolbar flat>
      <v-btn exact icon :to="{ name: 'templates' }">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title v-if="template">{{ template.label }}</v-toolbar-title>
      <v-toolbar-title v-else>{{ $t("Template") }}</v-toolbar-title>
      <v-spacer />

      <template v-if="user_is_manager">
        <v-btn
          color="#c00000"
          dark
          text
          :loading="deleting"
          @click="delete_template()"
        >
          <v-icon left>mdi-delete</v-icon>
          <span>{{ $t("Delete") }}</span>
        </v-btn>
        <v-btn text :loading="saving" @click="update_template()">
          <v-icon left>mdi-content-save</v-icon>
          <span>{{ $t("Save") }}</span>
        </v-btn>
      </template>
    </v-toolbar>
    <v-divider />

    <template v-if="template">
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              :readonly="!user_is_manager"
              :label="$t('Template name')"
              v-model="template.label"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-textarea
              :label="$t('Description')"
              auto-grow
              rows="1"
              :readonly="!user_is_manager"
              v-model="template.description"
              hint="Hint text"
            />
          </v-col>
        </v-row>
        <!-- Visibility -->
        <v-row align="center">
          <v-col cols="auto">{{ $t("Visibility") }}</v-col>
          <v-col cols="auto">
            <v-chip label outlined>{{ $t("You") }}</v-chip>
          </v-col>
          <v-col
            cols="auto"
            v-for="(group, index) in template.groups"
            :key="`group_${index}`"
          >
            <GroupChip
              :group="group"
              :close="user_is_manager"
              @click:close="remove_group(index)"
            />
          </v-col>
          <v-col cols="auto">
            <AddGroupDialog
              v-if="user_is_manager"
              @selection="add_group($event)"
            />
          </v-col>
        </v-row>
        <!-- Managers -->
        <v-row align="center">
          <v-col cols="auto">{{ $t("Managers") }}</v-col>

          <v-col
            cols="auto"
            v-for="(manager, index) in template.managers"
            :key="`manager_${index}`"
          >
            <UserChip :user="manager" />
          </v-col>

          <v-col cols="auto">
            <AddTemplateManagerDialog
              @selection="add_manager($event)"
              v-if="user_is_manager"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-card outlined>
          <v-toolbar flat>
            <v-toolbar-title>
              {{ $t("Fields") }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn v-if="user_is_manager" dark @click="add_field()">
              <v-icon left>mdi-plus</v-icon>
              <span>{{ $t("Add field") }}</span>
            </v-btn>
          </v-toolbar>
          <v-divider />
          <v-card-text>
            <v-row
              align="baseline"
              v-for="(field, index) in template.fields"
              :key="`field_${index}`"
            >
              <v-col>
                <v-text-field
                  :readonly="!user_is_manager"
                  :label="$t('Field name')"
                  v-model="field.label"
                />
              </v-col>
              <v-col>
                <v-select
                  :readonly="!user_is_manager"
                  :items="field_types"
                  item-text="label"
                  item-value="type"
                  v-model="field.type"
                  label="Type"
                />
              </v-col>
              <v-col v-if="user_is_manager" cols="auto">
                <v-btn
                  icon
                  :disabled="index === 0"
                  @click="move_field(index, -1)"
                >
                  <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
                <v-btn
                  icon
                  :disabled="index === template.fields.length - 1"
                  @click="move_field(index, 1)"
                >
                  <v-icon>mdi-arrow-down</v-icon>
                </v-btn>
              </v-col>
              <v-col v-if="user_is_manager" cols="auto">
                <v-btn icon color="#c00000" @click="delete_field(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
    </template>
  </v-card>
</template>

<script>
import IdUtils from "@/mixins/IdUtils.js"

import AddGroupDialog from "@/components/AddGroupDialog.vue"
import AddTemplateManagerDialog from "../components/templates/AddTemplateManagerDialog.vue"
import UserChip from "../components/UserChip.vue"
import GroupChip from "@/components/GroupChip.vue"

export default {
  name: "Template",
  components: {
    AddGroupDialog,
    AddTemplateManagerDialog,
    UserChip,
    GroupChip,
  },
  mixins: [IdUtils],
  data() {
    return {
      template: null,
      loading: false,
      saving: false,
      deleting: false,
    }
  },
  mounted() {
    this.get_template()
  },
  methods: {
    get_template() {
      this.loading = true
      const url = `/templates/${this.template_id}`
      this.axios
        .get(url)
        .then(({ data }) => {
          this.template = data
        })
        .catch((error) => console.log(error))
        .finally(() => {
          this.loading = false
        })
    },

    update_template() {
      this.saving = true
      const url = `/templates/${this.template_id}`
      const group_ids = this.template.groups.map((group) =>
        this.get_id_of_item(group)
      )
      const { fields, label, description } = this.template

      const body = {
        fields,
        label,
        description,
        group_ids,
      }

      this.axios
        .put(url, body)
        .then(() => {
          this.$router.push({ name: "templates" })
        })
        .catch((error) => {
          alert("Error while updating the template")
          console.log(error)
        })
        .finally(() => {
          this.saving = false
        })
    },

    add_manager(user) {
      if (!this.template.managers) this.$set(this.template, "managers", [])
      this.template.managers.push(user)
    },

    add_group(group) {
      if (!this.template.groups) this.$set(this.template, "groups", [])
      this.template.groups.push(group)
    },

    remove_group(index) {
      this.template.groups.splice(index, 1)
    },

    delete_template() {
      if (!confirm(`Delete template ${this.template_id}?`)) return
      this.deleting = true
      const url = `/templates/${this.template_id}`
      this.axios
        .delete(url)
        .then(() => {
          this.$router.push({ name: "templates" })
        })
        .catch((error) => {
          console.error(error)
          if (error.response) this.error_message = error.response.data
        })
        .finally(() => {
          this.deleting = false
        })
    },
    add_field() {
      this.template.fields.push({ type: "text", label: "" })
    },
    move_field(index, step) {
      const item = this.template.fields[index]
      const next_item = this.template.fields[index + step]
      this.$set(this.template.fields, index + step, item)
      this.$set(this.template.fields, index, next_item)
    },
    delete_field(index) {
      if (!confirm("ホンマ？")) return
      this.template.fields.splice(index, 1)
    },
  },
  computed: {
    template_id() {
      return this.$route.params.template_id
    },
    user_is_author() {
      // UNUSED for the moment
      if (!this.template) return false
      const author_id = this.template.author._id
      return author_id === this.current_user_id
    },
    user_is_manager() {
      if (!this.template) return false
      return this.template.managers
        .map(({ _id }) => _id)
        .includes(this.current_user_id)
    },

    field_types() {
      return [
        { type: "text", label: this.$t("Text") },
        { type: "file", label: this.$t("File") },
        { type: "pdf", label: this.$t("PDF File") },
        { type: "checkbox", label: this.$t("Checkbox") },
        { type: "date", label: this.$t("Date") },
        { type: "link", label: this.$t("Link") },
        { type: "application", label: this.$t("Application ID") },
        //{ type: 'file_path', label: 'ファイルパス / File path' },
      ]
    },
  },
}
</script>
