<template>
  <div class="application_info">

    <table class="">

      <!-- Application info -->
      <tr>
        <th colspan="2">申請情報 / Application details</th>
      </tr>
      <tr>
        <td>ID</td>
        <td>{{application.identity}}</td>
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
        <td>{{application.properties.type}}</td>
      </tr>

      <tr>
        <td>日付 / Date</td>
        <td>{{format_date(application.properties.creation_date)}}</td>
      </tr>
      <tr>
        <td>申請者 / Applicant</td>
        <td>
          <UserPreview :user="applicant" />
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

      <!-- Visibility / confidentiality -->
      <tr v-if="application.properties.private">
        <td>共有 / Visibility</td>
        <td class="visibility_wrapper">

          <!-- Approal flow group (dummy group) -->
          <div class="visibility_group">
            <span>承認フロー / Approval flow</span>
            <template v-if="user_is_applicant">
              <div class="growing_spacer"/>

              <button type="button" disabled>
                <delete-icon />
              </button>
            </template>
          </div>

          <div
            v-for="group in visibility"
            class="visibility_group"
            v-bind:key="group.identity.low || group.identity">

            <span class="">{{group.properties.name}}</span>

            <template v-if="user_is_applicant">
              <div class="growing_spacer"/>

              <button type="button"
                @click="remove_application_visibility_to_group(group)">
                <delete-icon />
              </button>

            </template>

          </div>

          <!-- Button to add a group to visibility -->
          <div
            class="visibility_group_add_button_wrapper"
            v-if="user_is_applicant">
            <button
              type="button"
              @click="modal_open = true">
              <account-multiple-plus-icon />
              <span>グループ追加 / Add a group</span>
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

      <!-- If form data is stored as an array -->
      <tr
        v-else-if="Array.isArray(form_data)"
        v-for="(field, index) in form_data"
        :key="`field_${index}`">

        <td>{{field.label || 'Unnamed field'}}</td>

        <td
          class="file_actions_container"
          v-if="field.type === 'pdf' && field.value">

          <div
            class="success"
            v-if="user_has_stamped_attachment(field.value)">
            ハンコを押しました
          </div>

          <div class="error" v-else>
            まだハンコを押してません
          </div>

          <div class="">
            <button
              type="button"
              @click="view_pdf(field.value)">
              <magnify-icon />
              <span>承認する / View and approve .pdf</span>
            </button>
          </div>

        </td>

        <td
          v-else-if="field.type === 'file' && field.value"
          class="file_actions_container" >

          <div class="">
            <button
              type="button"
              @click="download_attachment(field.value)">
              <download-icon />
              <span>Download</span>
            </button>
          </div>
          <div
            class=""
            v-if="file_has_hankos(field.value)">
            <button
              type="button"
              @click="view_pdf(field.value)">
              <magnify-icon />
              <span>承認する / View and approve .pdf</span>
            </button>
          </div>

        </td>

        <td v-else-if="field.type === 'checkbox'">
          <check-icon v-if="field.value"/>
          <close-icon v-else/>
        </td>

        <td v-else-if="field.type === 'date'">
          <span v-if="field.value">{{new Date(field.value).toLocaleDateString('ja-JP')}}</span>
          <span v-else>-</span>
        </td>

        <td v-else-if="field.type === 'link'">
          <a :href="field.value">
            <open-in-new-icon />
          </a>
        </td>

        <td v-else-if="field.type === 'application'">
          <router-link :to="{ name: 'application', params: {application_id: field.value} }">
            {{field.value}}
          </router-link>
        </td>

        <td v-else>{{field.value || '-'}}</td>

      </tr>

      <!-- If form data is not an array -->
      <tr v-else >
        <td colspan="2">Form data cannot be read</td>
      </tr>

    </table>

    <!-- Modal used for group visibility -->
    <Modal
      :open="modal_open"
      @close="modal_open=false">

      <h2 class="">共有 / Visibility</h2>

      <div class="group_picker_wrapper">
        <GroupPicker
          v-if="modal_open"
          class="picker"
          :apiUrl="picker_api_url"
          v-on:selection="share_with_group($event)"/>
      </div>
    </Modal>

  </div>
</template>

<script>

import download from 'downloadjs'

import Modal from '@moreillon/vue_modal'
import GroupPicker from '@moreillon/vue_group_picker'

import UserPreview from '@/components/UserPreview.vue'

import CurrentUserID from '@/mixins/CurrentUserID.js'
import DateFormatting from '@/mixins/DateFormatting.js'

export default {
  name: 'ApplicationInfo',
  components: {
    Modal,
    GroupPicker,
    UserPreview
  },
  mixins: [
    CurrentUserID,
    DateFormatting
  ],
  props: {
    application: Object,
    applicant: Object,
    forbidden: Boolean,
    visibility: Array,
    approvals: Array
  },
  data () {
    return {
      // modal for group visibility
      modal_open: false,
      // groups: [],
      picker_api_url: process.env.VUE_APP_GROUP_MANAGER_API_URL
    }
  },
  mounted () {

  },
  computed: {
    form_data () {
      return JSON.parse(this.application.properties.form_data)
    },
    user_is_applicant () {
      return this.applicant.identity === this.current_user_id
    },
    applicant_profile_url () {
      // THis should be done in an applicant component
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/?id=${this.applicant.identity}`
    }

  },
  methods: {

    update_privacy_of_application () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/privacy`
      this.axios.put(url, { private: this.application.properties.private })
        .then(() => {})
        .catch(() => alert('Error updating privacy of application'))
    },
    download_attachment (id) {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/files/${id}`

      // window.location.href = url

      // Temporary use of fetch because permission problems
      fetch(url, {
        headers: new Headers({
          'Authorization': `Bearer ${this.$cookies.get('jwt')}`
        })
      })
        .then((response) => {
          return response.blob()
        })
        .then((blob) => {
          download(blob, id)
        })
        .catch((error) => {
          alert(`Failed to download file`)
          console.error(error)
        })
    },
    share_with_group (group) {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/visibility_to_group`
      const body = {
        group_id: group.identity.low || group.identity
      }
      this.axios.post(url, body)
        .then(() => {
          this.modal_open = false
          this.$emit('visibility_update')
        })
        .catch(() => {
          alert('Error updating visibility of application')
        })
    },
    remove_application_visibility_to_group (group) {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/visibility_to_group`
      const params = {
        group_id: group.identity.low || group.identity
      }
      this.axios.delete(url, { params })
        .then(() => {
          this.$emit('visibility_update')
        })
        .catch((error) => {
          console.error(error)
          alert('Error updating visibility of application')
        })
    },
    view_pdf (file_id) {
      this.$emit('view_pdf', file_id)
    },
    user_has_stamped_attachment (file_id) {

      const found_approval = this.approvals.find((approval) => approval.start === this.current_user_id )

      if (!found_approval) return

      let attachment_hankos = found_approval.properties.attachment_hankos

      try { attachment_hankos = JSON.parse(attachment_hankos) }
      catch (error) { return false }

      
      return !!attachment_hankos.find(a => a.file_id ===  file_id)
    },
    file_has_hankos(file_id){
      return this.approvals.find((approval) => {
        let attachment_hankos = approval.properties.attachment_hankos
        return attachment_hankos
      } )

    }
  }

}
</script>

<style scoped>
.application_info {
  overflow-y: auto;
  width: 100%;
}
.application_info table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  table-layout: fixed;
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
