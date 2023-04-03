<template>
  <v-card>
    <v-card-title class="text-h4">申請マネージャ</v-card-title>
    <v-card-text>
      An alternative GUI for 申請マネージャー dedicated to handling .pdf files.
      Developped and maintained by Maxime MOREILLON.
    </v-card-text>

    <v-card-text>
      <v-data-table hide-default-footer :headers="headers" :items="settings" />
    </v-card-text>
  </v-card>
</template>

<script>
import pjson from "@/../package.json"

const {
  VUE_APP_SHINSEI_MANAGER_URL,
  VUE_APP_GROUP_MANAGER_API_URL,
  VUE_APP_EMPLOYEE_MANAGER_API_URL,
  VUE_APP_EMPLOYEE_MANAGER_FRONT_URL,
  VUE_APP_LOGIN_URL,
  VUE_APP_IDENTIFICATION_URL,
} = process.env

export default {
  name: "About",
  data() {
    return {
      version: pjson.version,
      headers: [
        { text: "Setting", value: "name" },
        { text: "Value", value: "value" },
      ],
      settings: [
        {
          name: "Shinsei manager API",
          value: VUE_APP_SHINSEI_MANAGER_URL,
        },
        {
          name: "Employee manager API",
          value: VUE_APP_EMPLOYEE_MANAGER_API_URL,
        },
        {
          name: "Employee manager GUI",
          value: VUE_APP_EMPLOYEE_MANAGER_FRONT_URL,
        },
        {
          name: "Group manager API",
          value: VUE_APP_GROUP_MANAGER_API_URL,
        },
        {
          name: "Login URL",
          value: VUE_APP_LOGIN_URL,
        },
        {
          name: "Identification URL",
          value: VUE_APP_IDENTIFICATION_URL,
        },
      ],
    }
  },
}
</script>
