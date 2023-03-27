<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t("Templates") }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn color="#c00000" dark :to="{ name: 'new_template' }">
        <v-icon>mdi-plus</v-icon>
        <span>{{ $t("Create template") }}</span>
      </v-btn>

      <template v-slot:extension>
        <v-tabs color="#444444" v-model="tab" align-with-title>
          <v-tabs-slider color="#c00000"></v-tabs-slider>

          <v-tab>
            {{ $t("My templates") }}
          </v-tab>
          <v-tab>
            {{ $t("Templates shared with me") }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-divider />

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card-text>
          <v-data-table
            :items-per-page="-1"
            :headers="headers"
            :items="templates_of_user"
            @click:row="view_template($event)"
            :loading="loading"
          >
            <template v-slot:item.groups="{ item }">
              <v-chip
                v-for="(group, index) in item.groups"
                :key="`${item._id}_group_${index}`"
                class="mr-2"
              >
                {{ group.name }}
              </v-chip>
            </template>

            <template v-slot:item.managers="{ item }">
              <v-chip
                v-for="(manager, index) in item.managers"
                :key="`${item._id}_manager_${index}`"
                class="mr-2"
              >
                {{ manager.display_name }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-tab-item>
      <v-tab-item>
        <v-card-text>
          <v-data-table
            :items-per-page="-1"
            :headers="headers"
            :items="shared_templates"
            @click:row="view_template($event)"
            :loading="loading"
          >
            <template v-slot:item.managers="{ item }">
              <v-chip
                v-for="(manager, index) in item.managers"
                :key="`${item._id}_manager_${index}`"
                class="mr-2"
              >
                {{ manager.display_name }}
              </v-chip>
            </template>

            <template v-slot:item.groups="{ item }">
              <v-chip
                v-for="(group, index) in item.groups"
                :key="`${item._id}_group_${index}`"
                class="mr-2"
              >
                {{ group.name }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import IdUtils from "@/mixins/IdUtils.js"

export default {
  name: "Templates",
  components: {},
  mixins: [IdUtils],
  data() {
    return {
      tab: null,

      application_templates: [],
      loading: false,
      error: null,
    }
  },
  mounted() {
    this.get_templates()
  },
  methods: {
    get_templates() {
      this.loading = true
      const url = `/templates`
      this.axios
        .get(url)
        .then(({ data }) => {
          this.application_templates = data
        })
        .catch((error) => {
          console.error(error)
          this.error = "Error loading templates"
        })
        .finally(() => {
          this.loading = false
        })
    },
    view_template(template) {
      const template_id = this.get_id_of_item(template)
      this.$router.push({ name: "template", params: { template_id } })
    },
    new_template() {
      this.$router.push({ name: "new_template" })
    },
  },
  computed: {
    headers() {
      return [
        { text: this.$t("Name"), value: "label" },
        { text: this.$t("Groups"), value: "groups" },
        { text: this.$t("Managers"), value: "managers" },
      ]
    },

    templates_of_user() {
      return this.application_templates.filter(({ managers }) =>
        managers.map(({ _id }) => _id).includes(this.current_user_id)
      )
    },
    shared_templates() {
      return this.application_templates.filter(
        ({ managers }) =>
          !managers.map(({ _id }) => _id).includes(this.current_user_id)
      )
    },
  },
}
</script>
