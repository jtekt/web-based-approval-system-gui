<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title class="text-h4">
        {{ card_title_lookup[direction] }}
      </v-toolbar-title>
      <v-spacer />

      <v-btn color="#c00000" dark :to="{ name: 'new_application' }">
        <v-icon left>mdi-plus</v-icon>
        <span>{{ $t("New application") }}</span>
      </v-btn>

      <template v-slot:extension>
        <v-tabs color="#444444" v-model="tab" align-with-title>
          <v-tabs-slider color="#c00000"></v-tabs-slider>

          <v-tab v-for="table in tables[direction]" :key="`tab_${table.state}`">
            <v-icon left>{{ table.icon }}</v-icon>
            <span>{{ table.title }} </span>
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-divider></v-divider>

    <v-tabs-items v-model="tab">
      <v-tab-item
        v-for="table in tables[direction]"
        :key="`tab_item_${table.state}`"
      >
        <v-card-text>
          <ApplicationListTable
            :title="table.title"
            :headers="table.headers"
            :direction="direction"
          />
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import ApplicationListTable from "@/components/application_list/ApplicationListTable.vue"
export default {
  name: "ApplicationList",
  components: {
    ApplicationListTable,
  },
  props: {
    direction: String,
  },
  data() {
    return {}
  },
  methods: {
    setQueryParam(key, value) {
      if (this.$route.query[key] === value) return
      const query = { ...this.$route.query }
      if (value) query[key] = value
      else delete query[key]
      this.$router.replace({ query })
    },
  },
  computed: {
    card_title_lookup() {
      return {
        submitted: this.$t("Outbox"),
        received: this.$t("Inbox"),
      }
    },
    states() {
      return this.tables[this.direction].map(({ state }) => state)
    },
    tab: {
      get() {
        const { state = "pending" } = this.$route.query
        return this.states.indexOf(state)
      },
      set(tabIndex) {
        const state = this.states[tabIndex]
        this.setQueryParam("state", state)
      },
    },
    tables() {
      return {
        submitted: [
          {
            title: this.$t("Pending"),
            state: "pending",
            icon: "mdi-progress-clock",
            headers: [
              { text: this.$t("Date"), value: "creation_date" },
              { text: this.$t("Type"), value: "type" },
              { text: this.$t("Title"), value: "title" },
              { text: "%", value: "progress", width: "10ch" },
              {
                text: this.$t("Current recipient"),
                value: "current_recipient",
              },
            ],
          },
          {
            title: this.$t("Rejected"),
            state: "rejected",
            icon: "mdi-close-circle-outline",
            headers: [
              { text: this.$t("Date"), value: "creation_date" },
              { text: this.$t("Type"), value: "type" },
              { text: this.$t("Title"), value: "title" },
              { text: "%", value: "progress", width: "10ch" },
              {
                text: this.$t("Current recipient"),
                value: "current_recipient",
              },
            ],
          },
          {
            title: this.$t("Approved"),
            state: "approved",
            icon: "mdi-check-circle-outline",
            headers: [
              { text: this.$t("Date"), value: "creation_date" },
              { text: this.$t("Type"), value: "type" },
              { text: this.$t("Title"), value: "title" },
            ],
          },
        ],
        received: [
          {
            title: this.$t("Pending"),
            state: "pending",
            icon: "mdi-progress-clock",
            headers: [
              { text: this.$t("Date"), value: "creation_date" },
              { text: this.$t("Type"), value: "type" },
              { text: this.$t("Title"), value: "title" },
              { text: this.$t("Applicant"), value: "applicant" },
            ],
          },
          {
            title: this.$t("Rejected"),
            state: "rejected",
            icon: "mdi-close-circle-outline",
            headers: [
              { text: this.$t("Date"), value: "creation_date" },
              { text: this.$t("Type"), value: "type" },
              { text: this.$t("Title"), value: "title" },
              { text: this.$t("Applicant"), value: "applicant" },
            ],
          },
          {
            title: this.$t("Approved"),
            state: "approved",
            icon: "mdi-check-circle-outline",
            headers: [
              { text: this.$t("Date"), value: "creation_date" },
              { text: this.$t("Type"), value: "type" },
              { text: this.$t("Title"), value: "title" },
              { text: this.$t("Applicant"), value: "applicant" },
            ],
          },
        ],
      }
    },
  },
}
</script>
