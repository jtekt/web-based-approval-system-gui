<template>
  <v-expansion-panels
    v-if="selected_form && !this.$route.query.copy_of"
    flat
    accordion
  >
    <v-expansion-panel>
      <v-expansion-panel-header>
        {{ $t("Type") }}: {{ selected_form.label }} ({{
          $t("Click for more info")
        }})
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row align="baseline">
          <!-- TODO: use managers instead -->
          <v-col cols="auto">
            {{ $t("Template author") }}
          </v-col>

          <UserChip
            v-for="(manager, index) in selected_form.managers"
            :key="`manager_${index}`"
            class="mr-2"
            :user="manager"
          />

          <v-spacer />
        </v-row>

        <v-row>
          <v-col cols="12" class="form_description">
            {{ selected_form.description }}
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="auto">
            <router-link
              :to="{
                name: 'template',
                params: { template_id: selected_form._id },
              }"
            >
              {{ $t("Template page") }}
            </router-link>
          </v-col>
        </v-row>
        <v-divider class="mt-4"></v-divider>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import UserChip from "../UserChip.vue"

export default {
  name: "NewApplicationTemplateDetails",
  components: {
    UserChip,
  },
  props: {
    selected_form: Object,
  },
  data() {
    return {}
  },
  methods: {},
  computed: {},
}
</script>
