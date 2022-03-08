<template>
  <div class="application_info">

    <table class="">

      <!-- Application info -->
      <tr>
        <th colspan="2">申請情報 / Application details</th>
      </tr>
      <tr>
        <td>ID</td>
        <td>{{get_id_of_item(application)}}</td>
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
            v-for="(group, index) in visibility"
            class="visibility_group"
            :key="`visibility_group_${index}`">

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

          <template v-if="user_as_recipient">
            <div
              class="success"
              v-if="user_has_stamped_attachment(field.value)">
              ハンコを押しました
            </div>

            <div class="error" v-else>
              まだハンコを押してません
            </div>
          </template>


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
          <a
            class="field_link"
            :href="field.value"
            target="_blank">
            <span>{{field.value}}</span>
            <open-in-new-icon />
          </a>
        </td>

        <td v-else-if="field.type === 'application'">
          <a
            class="field_link"
            :href="`/applications/${field.value}`"
            target="_blank">
            <span>{{field.value}}</span>
            <open-in-new-icon />
          </a>
        </td>

        <!-- <td v-else-if="field.type === 'file_path'">
          <a
            class="field_link"
            :href="`file:///${field.value}`">
            <span>{{field.value}}</span>
            <open-in-new-icon />
          </a>
        </td> -->

        <td v-else class="application_field_value">{{field.value || '-'}}</td>

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

import DateFormatting from '@/mixins/DateFormatting.js'
import IdUtils from '@/mixins/IdUtils.js'


export default {
  name: 'ApplicationInfo',
  components: {
    Modal,
    GroupPicker,
    UserPreview
  },
  mixins: [
    DateFormatting,
    IdUtils,
  ],
  props: {
    application: Object,
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
    if(!this.application) console.log(`UNWANTED EXECUTION`);
  },
  computed: {
    application_id(){
      return this.get_id_of_item(this.application)
    },
    form_data () {
      //return JSON.parse(this.application.properties.form_data)
      return this.application.properties.form_data
    },
    user_is_applicant () {
      return this.get_id_of_item(this.applicant) === this.current_user_id
    },
    applicant_profile_url () {
      // THis should be done in an applicant component
      const applicant_id = this.get_id_of_item(this.applicant)
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/users/${applicant_id}`
    },
    visibility() {
      return this.application.visibility
    },
    applicant() {
      return this.application.applicant
    },
    forbidden() {

      return this.application.forbidden
    },
    approvals() {
      return this.application.recipients
        .filter(a => !!a.approval)
        .map(r => r.approval)
    },
    user_as_recipient(){
      return this.application.recipients.find(recipient => this.get_id_of_item(recipient) === this.current_user_id)
    },

  },
  methods: {

    update_privacy_of_application () {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/privacy`
      this.axios.put(url, { private: this.application.properties.private })
        .then(() => {})
        .catch(() => alert('Error updating privacy of application'))
    },
    download_attachment (id) {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/files/${id}`
      window.open(url,'_blank')
    },
    share_with_group (group) {
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/visibility_to_group`
      const body = { group_id: this.get_id_of_item(group) }
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
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/visibility_to_group`
      const params = { group_id: this.get_id_of_item(group) }
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

      if(typeof attachment_hankos === 'string'){
        try {  attachment_hankos = JSON.parse(attachment_hankos)  }
        catch (e) {  console.error('Failed to parse attachment hankos') }
      }

      if(!attachment_hankos) return

      return !!attachment_hankos.find(a => a.file_id === file_id)

    },
    file_has_hankos(file_id){



      return this.approvals.find((approval) => {
        let attachment_hankos = approval.properties.attachment_hankos
        if(!attachment_hankos) return false


        if(typeof attachment_hankos === 'string'){
          try {  attachment_hankos = JSON.parse(attachment_hankos)  }
          catch (e) {  console.error('Failed to parse attachment hankos') }
        }

        //return !!attachment_hankos.find(a => a.file_id === file_id)
        return !!attachment_hankos
      } )

    },
  },



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
  /* text-align: center; */
  table-layout: fixed;
}

.application_info td, .application_info th {
  padding: 5px;
}

.application_info th {
  text-align: left;
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

.application_field_value{
  white-space: pre-line;
}

.field_link {
  display: inline-flex;
  align-items: center;
}

.field_link span {
  margin-right: 0.25em;
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

</style>
