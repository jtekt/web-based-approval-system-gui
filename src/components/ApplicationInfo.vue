<template>
  <div class="application_info">

    <table class="">

      <!-- Application info -->
      <tr>
        <th colspan="2">申請情報 / Application details</th>
      </tr>
      <tr>
        <td>ID</td>
        <td>{{application.identity.low}}</td>
      </tr>
      <tr>
        <td>タイトル / Title</td>
        <td v-if="forbidden">
          <span class="confidential"/>
        </td>
        <td v-else>{{application.properties.title}}</td>
      </tr>
      <tr>
        <td>タイプ / Type</td>
        <td v-if="forbidden">
          <span class="confidential"/>
        </td>
        <td v-else>{{application.properties.type}}</td>
      </tr>

      <tr>
        <td>日付 / Date</td>
        <td>
          {{application.properties.creation_date.year.low}}/{{application.properties.creation_date.month.low}}/{{application.properties.creation_date.day.low}}
        </td>
      </tr>
      <tr>
        <td>申請者 / Applicant</td>
        <!-- Todo: put a link here -->
        <td>
          <a
            :href="applicant_profile_url"
            class="applicant_name">
            <img
              class="applicant_avatar"
              v-if="applicant.properties.avatar_src"
              :src="applicant.properties.avatar_src">
            <span>
              {{ applicant.properties.display_name
                || applicant.properties.name_kanji
                || applicant.properties.name
                || applicant.properties.username}}
            </span>

          </a>
        </td>
      </tr>
      <tr>
        <td>機密 / Confidential</td>
        <td>
          <input
          type="checkbox"
          v-bind:disabled="!user_is_applicant"
          v-model="application.properties.private"
          v-on:change="update_privacy_of_application()">
        </td>
      </tr>

      <!-- Visibility -->
      <tr v-if="application.properties.private">
        <td>共有 / Visibility</td>
        <td class="visibility_wrapper">

          <div
            class="visibility_groups_wrapper"
            v-if="groups.length > 0">
            <div
              v-for="group in groups"
              class="visibility_group"
              v-bind:key="group.identity.low">
              <span class="">
                {{group.properties.name}}
              </span>

              <template v-if="user_is_applicant">
                <div class="growing_spacer"/>

                <button type="button"
                  @click="remove_application_visibility_to_group(group)">
                  <delete-icon />
                </button>


              </template>

            </div>
          </div>
          <div class="" v-else>
            承認フローのみ / Approval flow only
          </div>

          <!-- Button to add a group to visibility -->
          <div
            class="visibility_group_add_button_wrapper"
            v-if="user_is_applicant">
            <button
              type="button"
              @click="modal_open = true">
              <account-multiple-plus-icon />
            </button>

          </div>

        </td>
      </tr>

      <!-- Actual data of the application -->
      <tr>
        <th colspan="2">申請内容 / Application content</th>
      </tr>

      <tr v-if="forbidden">
        <td colspan="2">
          <span class="confidential"/>
        </td>
      </tr>

      <!-- If form data is stored as an array (experiment) -->
      <!-- THIS IS HOW CURRENT APPLICATIONS ARE RENDERED -->
      <tr
        v-else-if="Array.isArray(form_data)"
        v-for="field in form_data">
        <td>{{field.label || 'Unnamed field'}}</td>

        <td
          class="file_actions_container"
          v-if="field.type === 'file' && field.value">

          <button
            type="button"
            @click="download_attachment(field.value)">
            <download-icon />
            <span>Download (original)</span>
          </button>

          <button
            type="button"
            @click="view_pdf(field.value)">
            <magnify-icon />
            <span>View</span>
          </button>


        </td>

        <td v-else-if="field.type === 'checkbox'">
          <check-icon v-if="field.value"/>
          <close-icon v-else/>
        </td>

        <td v-else-if="field.type === 'date'">
          <span v-if="field.value">{{new Date(field.value).toLocaleDateString('ja-JP')}}</span>
          <span v-else>-</span>
        </td>

        <td v-else>{{field.value || '-'}}</td>

      </tr>

      <!-- If form data is not an array -->
      <tr v-else >
        <td colspan="2">Form data cannot be read</td>
      </tr>

    </table>



    <!-- Model used for group visibility -->
    <Modal :open="modal_open" @close="modal_open=false">
      <h2 class="">
        共有 / Visibility
      </h2>
      <div class="group_picker_wrapper">
        <GroupPicker
          class="picker"
          :apiUrl="picker_api_url"
          v-on:selection="share_with_group($event)"/>
      </div>
    </Modal>

  </div>
</template>

<script>

import Modal from '@moreillon/vue_modal'
import GroupPicker from '@moreillon/vue_group_picker'

// Icons
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue'
import AccountMultiplePlusIcon from 'vue-material-design-icons/AccountMultiplePlus.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'

export default {
  name: 'ApplicationInfo',
  components: {
    Modal,
    GroupPicker,

    DownloadIcon,
    MagnifyIcon,
    AccountMultiplePlusIcon,
    DeleteIcon,
    CheckIcon,
    CloseIcon,
  },
  props: {
    application: Object,
    applicant: Object,
    forbidden: Boolean,
  },
  data(){
    return {
      // modal for group visibility
      modal_open: false,
      groups: [],
      picker_api_url: process.env.VUE_APP_GROUP_MANAGER_API_URL
    }
  },
  mounted(){
    this.get_visibility()

  },
  computed: {
    form_data () {
      return JSON.parse(this.application.properties.form_data)
    },
    user_is_applicant () {
      return this.applicant.identity.low === this.$store.state.current_user.identity.low
    },
    applicant_profile_url(){
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/?id=${this.applicant.identity.low}`
    }

  },
  methods: {
    get_visibility () {
      // Gets the groups wi which this application is visible
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/visibility`
      this.axios.get(url)
        .then(response => {
          this.groups = []
          response.data.forEach((record) => {
            let group = record._fields[record._fieldLookup['group']]
            this.groups.push(group)
          })
        })
        .catch((error) => console.log(error))
    },
    update_privacy_of_application () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/privacy`
      this.axios.put(url, {private: this.application.properties.private})
        .then(() => {})
        .catch(() => alert('Error updating privacy of application'))
    },

    download_attachment (id) {
      window.location.href = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/files/${id}`
    },
    share_with_group (group) {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/visibility_to_group`

      this.axios.post(url, { group_id: group.identity.low })
      .then(() => {
        this.modal_open = false
        this.get_visibility()
      })
      .catch(() => alert('Error updating visibility of application'))
    },
    remove_application_visibility_to_group (group) {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/visibility_to_group`

      this.axios.delete(url, { params: { group_id: group.identity.low } })
      .then(() => { this.get_visibility() })
      .catch(() => alert('Error updating visibility of application'))
    },
    view_pdf(file_id){
      this.$emit('view_pdf',file_id)
    }
  }

}
</script>

<style scoped>
.application_info table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.application_info td, .application_info th {
  padding: 5px;
}

.application_info th {
  padding-top: 10px;
}

.application_info td {
  border-top: 1px solid #dddddd;
}

.group_picker_wrapper {
  height: 50vh;
  width: 75vw;
}

.visibility_group {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25em;
}

.visibility_group:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.growing_spacer {
  flex-grow: 1;
}

.visibility_group_add_button_wrapper{
  margin-top: 0.25em;
}

.file_actions_container > *:not(:last-child) {
  margin-right: 1em;
}

.picker {
  height: 100%;
}

.applicant_avatar {
  height: 1em;
  width: 1em;
  margin-right: 0.25em;
}

.applicant_name {
  display: inline-flex;
  align-items: center;
}

</style>
