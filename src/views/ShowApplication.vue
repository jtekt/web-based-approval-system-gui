<template>
  <div class="show_application">

    <template v-if="!loading && !error">
      <div class="application_container" v-if="application">

        <!-- information about the application form -->
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
              <td>{{application.properties.title}}</td>
            </tr>
            <tr>
              <td>タイプ / Type</td>
              <td>{{application.properties.type}}</td>
            </tr>

            <tr>
              <td>日付 / Date</td>
              <td>
                {{application.properties.creation_date.year.low}}/{{application.properties.creation_date.month.low}}/{{application.properties.creation_date.day.low}}
              </td>
            </tr>
            <tr>
              <td>申請者 / Applicant</td>
              <td>{{applicant.properties.display_name}}</td>
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
              <td>

                <template v-if="groups.length > 0">
                  <div
                    v-for="group in groups"
                    class="group"
                    v-bind:key="group.identity.low">
                    <span class="">
                      {{group.properties.name}}
                    </span>

                    <template v-if="user_is_applicant">
                      <div class="growing_spacer"/>
                      <button
                        type="button"
                        v-on:click="remove_application_visibility_to_group(group)">
                        remove
                      </button>
                    </template>

                  </div>
                </template>
                <div class="" v-else>
                  承認フローのみ / Approval flow only
                </div>

                <div class="">
                  <button
                    type="button"
                    v-on:click="modal_open = true"
                    v-if="user_is_applicant">Add a group</button>
                </div>
              </td>
            </tr>

            <!-- Actual data of the application -->
            <tr>
              <th colspan="2">申請内容 / Application content</th>
            </tr>

            <!-- If form data is stored as an array (experiment) -->
            <!-- THIS IS HOW CURRENT APPLICATIONS ARE RENDERED -->
            <tr v-for="field in form_data" v-if="Array.isArray(form_data)">
              <td>{{field.label}}</td>

              <td v-if="field.type === 'file' && field.value">

                <download-icon
                  v-on:click="download(field.value)"
                  class="download_button"/>


                <button type="button" @click="view_pdf(field.value)" v-if="true">.pdf viewer</button>
              </td>

              <td v-else-if="field.type === 'checkbox'">
                <span v-if="field.value" class="mdi mdi-check"/>
                <span v-else class="mdi mdi-close"/>
              </td>

              <td v-else-if="field.type === 'date'">
                <span v-if="field.value">{{new Date(field.value).toLocaleDateString('ja-JP')}}</span>
                <span v-else>-</span>
              </td>

              <td v-else-if="field.value">{{field.value}}</td>

              <!-- missing value -->
              <td v-else>-</td>
            </tr>

            <!-- LEGACY -->
            <!-- If form data is an object (OLD style) -->
            <tr v-for="value, key in form_data" v-if="!Array.isArray(form_data)">
              <td>{{key}}</td>
              <td v-if="key === 'report_file' || key === 'file'">
                <span
                  v-on:click="download(value)"
                  class="mdi mdi-download download_button"/>
              </td>
              <td v-else>{{value}}</td>
            </tr>
            <!-- END OF LEGACY -->

          </table>

          <!-- actions at the bottom: Delete or duplicate-->
          <div
            class="actions_container"
            v-if="user_is_applicant">

            <IconButton
              v-on:clicked="delete_application(application.identity.low)"
              icon="mdi-delete"
              bordered>
              削除 / Delete</IconButton>

            <IconButton
              v-on:clicked="edit_a_copy(application.identity.low)"
              icon="mdi-content-duplicate"
              bordered>
              複製 / Duplicate</IconButton>

          </div>

        </div>

        <!-- area with the hankos -->
        <div class="approval_flow_column">
          <div class="hanko_container_container" >

            <!-- inner wrapper exists so that arrows can be placed between hanko containers -->
            <div
              class="hanko_container_container_intermediate_wrapper"
              v-for="(recipient_record, index) in recipient_records">

              <span v-if="index>0" class="arrow mdi mdi-arrow-left"/>

              <WebHankoContainer
                v-bind:applicationRecord="recipient_record"
                v-on:approve="approve(application.identity.low)"
                v-on:reject="reject(application.identity.low)"
                v-on:cancel="cancel(application.identity.low)"
                v-bind:hankoable="hankoable(recipient_record)"/>
            </div>

          </div>

          <!-- area for refusals reasons -->
          <div class="refusal_reasons">
            <table>
              <tr
                v-for="(recipient_record, index) in recipient_records"
                v-if="recipient_record._fields[recipient_record._fieldLookup['rejection']]">
                <td class="refuser_name">{{recipient_record._fields[recipient_record._fieldLookup['recipient']].properties.family_name_kanji }}</td>
                <td>{{recipient_record._fields[recipient_record._fieldLookup['rejection']].properties.reason}}</td>
              </tr>
            </table>

          </div>
        </div>

      </div><!-- End of application container -->
      <div class="not_found" v-else>Application does not exist or is private</div>

      <div class="pdf_wrapper" v-if="shown_pdf">

        <div
          class="pdf_container"
          ref="pdf_container"
          @click="pdf_clicked($event)">

          <pdf :src="shown_pdf" />

          <div
            class="new_hanko_overlay"
            @mousemove="update_new_hanko_position($event)"/>

          <img
            v-if="new_hanko.src"
            v-bind:style="new_hanko.style"
            class="new_hanko"
            :src="new_hanko.src" alt="">

        </div>

      </div>


    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader>Loading application</Loader>
    </div>

    <div class="not_found" v-if="error">
      Error loading application
    </div>

    <Modal :open="modal_open" @close="modal_open=false">
      <h2 class="">
        Share application with a group
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
import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'
import IconButton from '@/components/IconButton.vue'
import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'
import GroupPicker from '@moreillon/vue_group_picker'

import DownloadIcon from 'vue-material-design-icons/Download.vue';



// Experiment with stamping pdf files
import { PDFDocument } from 'pdf-lib';
import pdf from 'vue-pdf'

export default {
  name: 'ShowApplication',
  components: {
    WebHankoContainer,
    IconButton,
    Loader,
    Modal,
    GroupPicker,
    DownloadIcon,

    pdf,
  },
  mounted () {
    this.get_application()
    this.get_visibility()
    this.get_approval_flow()
  },
  data () {
    return {

      recipient_records: [], // LEGACY, SHOULD BE DELETED WHEN DONE

      loading: false,
      error: null,

      // experimental
      application: null,
      applicant: null,

      groups: [],
      recipient_records: [],

      modal_open: false,

      // Stamping pdfs
      pdfDoc: null,
      original_pdf: null,
      shown_pdf: null,
      selected_file_id: null,
      new_hanko: {
        src: null,
        style: {
          top: '0px',
          left: '0px',
          width: '0px',
          height: '0px',
        }

      },
    }
  },
  methods: {
    get_application () {
      // Get the body of the application, regardless of its recipients
      // This gets the applicant as well (for the time being)

      // TODO: CHeck if id in query
      this.loading = true
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}`
      this.axios.get(url)
        .then(response => {
          if (response.data.length > 0) {
            let record = response.data[0]
            this.application = record._fields[record._fieldLookup['application']]
            this.applicant = record._fields[record._fieldLookup['applicant']]
          }
        })
        .catch((error) => { this.error = error })
        .finally(() => this.loading = false)
    },
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
    get_approval_flow () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/recipients`

      this.axios.get(url)
        .then(response => {
          this.recipient_records = []
          response.data.forEach((record) => {
            this.recipient_records.push(record)

            let approval = record._fields[record._fieldLookup['approval']]
            if(!approval) return
            if(!approval.properties.attachment_hankos) return
            approval.properties.attachment_hankos = JSON.parse(approval.properties.attachment_hankos)

          })
        })
        .catch((error) => console.log(error))
    },
    delete_application (application_id) {
      if (confirm('ホンマ？')) {
        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}`

        this.axios.delete(url)
          .then(() => this.$router.push('/'))
          .catch(() => alert(`Error deleting application`))
      }
    },
    approve (application_id) {
      // ask for confirmation
      if (!confirm('ホンマ？')) return

      // send POST to mark as approved
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/approve`
      this.axios.post(url)
        .then(() => {
          // Refresh the approval flow
          this.get_approval_flow()

          // Code to send email
          let next_recipient_record = this.recipient_records.find(record => {
            let recipient = record._fields[record._fieldLookup['submitted_to']]
            return recipient.properties.flow_index.low === this.approval_count + 1
          })

          if (!next_recipient_record) return
          let next_recipient = next_recipient_record._fields[next_recipient_record._fieldLookup['recipient']]

          // Weird formatting because preserves indentation
          window.location.href = `
mailto:${next_recipient.properties.email_address}
?subject=[自動送信] ${this.application.properties.type}を提出しました
&body=${next_recipient.properties.name_kanji}　様%0D%0A
%0D%0A
提出先URL%0D%0A
${window.location.origin}/show_application?id=${this.application.identity.low}%0D%0A
%0D%0A
確認お願いします。%0D%0A
            `

        })
        .catch((error) => {
          console.error(error)
          alert(`Error approving application`)
        })
    },
    reject (application_id) {
      if (confirm('ホンマ？')) {
        var reason = prompt('なぜ？', '')

        if (reason) {
          let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.$route.query.id}/reject`

          this.axios.post(url, { reason: reason })
            .then(() => this.get_approval_flow())
            .catch(() => alert('Error rejecting application'))
        }
      }
    },
    update_privacy_of_application () {
      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/privacy`
      this.axios.put(url, {private: this.application.properties.private})
        .then(() => {})
        .catch(() => alert('Error updating privacy of application'))
    },

    edit_a_copy (application_id) {
      this.$router.push({ path: '/create_application', query: { copy_of: application_id } })
    },
    download (id) {
      window.location.href = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/files/${id}`
    },
    see_template (id) {
      this.$router.push({ path: '/edit_application_template', query: { id: id } })
    },
    hankoable (recipient_record) {
      let flow_index = recipient_record._fields[recipient_record._fieldLookup['submitted_to']].properties.flow_index.low
      return flow_index === this.approval_count
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

      // DIRTY
      this.selected_file_id = file_id

      this.set_new_hanko_src()

      let file_url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/files/${file_id}?application_id=${this.application.identity.low}`
      fetch(file_url, {
        headers: new Headers({
          'Authorization': `Bearer ${this.$cookies.get('jwt')}`,
        }),
      }).then((response) => { return response.arrayBuffer() })
      .then((buffer) => {
        this.load_pdf(buffer)
      })
    },
    async load_pdf(buffer) {

      try {
        this.pdfDoc = await PDFDocument.load(buffer)
        //this.shown_pdf = await this.pdfDoc.save()
        //this.original_pdf = this.shown_pdf
        this.load_pdf_hankos()
      } catch (e) {
        alert('Document is not a pdf')
      } finally {

      }
    },

    svg_to_png_url(svg){

      // Create an image element
      let img = new Image()
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      const DOM_URL = window.URL || window.webkitURL || window

      canvas.width = 1000
      canvas.height = 1500

      // Convert SVG to blob
      const SVG_sata = (new XMLSerializer()).serializeToString(svg)
      const SVG_blob = new Blob([SVG_sata], { type: 'image/svg+xml;charset=utf-8' })
      const SVG_blob_URL = DOM_URL.createObjectURL(SVG_blob)

      // Have the SVG blob URL be the image src
      img.src = SVG_blob_URL
      return new Promise( (resolve, reject) => {
        img.onload = () => {

          ctx.drawImage(img, 0, 0)
          DOM_URL.revokeObjectURL(SVG_blob_URL)
          let png_URL = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')

          resolve(png_URL)
        }
      })

    },

    async load_pdf_hankos(){

      // using promises to only save the pdf when all hankos are drawn
      let promises = []

      // For each recipient
      this.recipient_records.forEach(async (record) => {

        // using promises to only save the pdf when all hankos are drawn
        let promise = new Promise ( async(resolve, reject) => {
          let approval = record._fields[record._fieldLookup['approval']]
          if(!approval) resolve()
          if(!approval.properties.attachment_hankos) resolve()

          // Get the hanko's svg
          const hanko_svg = document.getElementById(`hanko_${approval.identity.low}`)

          // Convert the hanko's svg into a png URL
          const png_url = await this.svg_to_png_url(hanko_svg).then((png_url) => {return png_url})

          // Get the png image bytes from the canvas
          const pngImageBytes = await fetch(png_url).then((res) => {return res.arrayBuffer()})
          const pngImage = await this.pdfDoc.embedPng(pngImageBytes)
          const pngDims = pngImage.scale(0.03)

          const pages = this.pdfDoc.getPages()

          // Draw every hanko
          approval.properties.attachment_hankos.forEach(async (hanko) => {
            if(hanko.file_id !== this.selected_file_id) resolve()

            const page = pages[hanko.page_number]

            console.log(`Page width: ${page.getSize().width}`)

            await page.drawImage(pngImage, {
              x: hanko.position.x - 0.5 * pngDims.width,
              y: hanko.position.y - 0.5 * pngDims.height,
              width: pngDims.width,
              height: pngDims.height,
            })

            resolve()

          })
        })

        promises.push(promise)

      })

      Promise.all(promises).then(async () => {
        this.shown_pdf = await this.pdfDoc.save()
      })


    },
    update_new_hanko_position(event){
      this.new_hanko.style.left = `calc(${event.offsetX}px - 0.5 * ${this.new_hanko.style.width})`
      this.new_hanko.style.top = `calc(${event.offsetY}px - 0.5 * ${this.new_hanko.style.height})`

      const wrapper_width = this.$refs.pdf_container.offsetWidth
      const wrapper_height = this.$refs.pdf_container.offsetHeight

      this.new_hanko.style.width= `${0.05*wrapper_width}px`
      this.new_hanko.style.height= `${0.05*wrapper_height}px`

    },
    set_new_hanko_src(){
      let found_recipient_record = this.recipient_records.find(record => {
        let recipient = record._fields[record._fieldLookup['recipient']]
        let recipient_id = recipient.identity.low
        return recipient_id = this.$store.state.current_user.identity.low
      })

      let approval = found_recipient_record._fields[found_recipient_record._fieldLookup['approval']]
      if(!approval) return alert('You need to approve the application first')

      let approval_id = approval.identity.low

      const hanko_svg = document.getElementById(`hanko_${approval_id}`)
      const SVG_sata = (new XMLSerializer()).serializeToString(hanko_svg)
      const SVG_blob = new Blob([SVG_sata], { type: 'image/svg+xml;charset=utf-8' })
      const DOM_URL = window.URL || window.webkitURL || window
      const SVG_blob_URL = DOM_URL.createObjectURL(SVG_blob)

      this.new_hanko.src = SVG_blob_URL
    },
    async pdf_clicked(event){

      //return alert('研究企画が官僚的な考え方をやめてくれないとこの機能を使えないようにします')

      let found_recipient_record = this.recipient_records.find(record => {
        let recipient = record._fields[record._fieldLookup['recipient']]
        let recipient_id = recipient.identity.low
        return recipient_id = this.$store.state.current_user.identity.low
      })

      let approval = found_recipient_record._fields[found_recipient_record._fieldLookup['approval']]
      if(!approval) return alert('You need to approve the application first')

      let approval_id = approval.identity.low
      let page_number = 0


      if(!confirm(`Apply Hanko here?`)) return

      const pages = this.pdfDoc.getPages()
      const page = pages[page_number]
      const { width, height } = page.getSize()

      const wrapper_width = this.$refs.pdf_container.offsetWidth
      const click_x = event.offsetX
      const position_x = width * (click_x/wrapper_width)

      const wrapper_height = this.$refs.pdf_container.offsetHeight
      const click_y = event.offsetY
      const position_y = height - (height * (click_y/wrapper_height))

      // Create a list of attachment hankos if they don't exist yet

      if(!approval.properties.attachment_hankos) {
        approval.properties.attachment_hankos = []
      }

      let attachment_hanko = {
        file_id: this.selected_file_id,
        page_number: page_number,
        position: {
          x: position_x,
          y: position_y,
        }
      }

      approval.properties.attachment_hankos.push(attachment_hanko)
      console.log(this.recipient_records)

      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity.low}/approvals/${approval_id}`

      this.axios.put(url, { attachment_hankos: approval.properties.attachment_hankos })
      .then((response) => {
        this.view_pdf(this.selected_file_id)

      })
      .catch((error) => {
        console.log(error.response.data)
      })


    },



  },
  computed: {
    form_data () {
      return JSON.parse(this.application.properties.form_data)
    },
    based_on_template () {
      if (this.template) return true
      else return false
    },
    approval_count () {
      return this.recipient_records.reduce((approval_count, e) => {
        return approval_count + !!e._fields[e._fieldLookup['approval']]
      }, 0)
    },
    picker_api_url () {
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
    },
    user_is_applicant () {
      return this.applicant.identity.low === this.$store.state.current_user.identity.low
    }

  }
}
</script>

<style scoped>

.loader_wrapper{
  display: flex;
  justify-content: center;
  font-size: 120%;
}
.application_container {

  border: 1px solid #444444;
  border-radius: 5px;

  //margin: 15px;
  padding: 5px;

  display: flex;
  flex-wrap: wrap-reverse; /* THIS IS BRILLIANT */

}

.application_container > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 400px;
}

.application_info {
}

/* Application info table */
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

/* Hanko area */
.approval_flow_column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.hanko_container_container{
  /* horizontal layout */
  display: flex;
  justify-content: flex-end;
}

.hanko_container_container_intermediate_wrapper{
  /* exists so as to contan arrows */
  display: flex;
  align-items: flex-start;
}

.arrow{
  height: 150px;
  display: flex;
  align-items: center;
}

.refusal_reasons{
  margin-left: 25px;
  margin-top: 15px;
  margin-right: 5px;
  margin-bottom: 15px;
}

.refusal_reasons table {
  border: 1px solid #dddddd;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
.refusal_reasons table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.refusal_reasons table td {
  padding: 5px;
}

.refusal_reasons table th:first-child {
  width: 20%;
}
.refusal_reasons table .refuser_name {
  width: 20%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

/* MISC */
.not_found {
  padding: 25px;
  text-align: center;
}

.actions_container {
  margin-top: 25px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-around;
}

.action_button{
  border: 1px solid #444444;
  border-radius: 5px;
  padding: 5px;
  font-size: 120%;
  cursor: pointer;
  transition: color 0.25s border-color 0.25s;
}

.action_button:hover {
  color: #c00000;
  border-color: #c00000;
}

.download_button{
  font-size: 150%;
  cursor: pointer;
}

.template_row {
  cursor: pointer;
  transition: color 0.25s border-color 0.25s;
}

.template_row:hover {
  color: #c00000;
}

.group_picker_wrapper {
  height: 50vh;
  width: 75vw;
}

.group {
  display: flex;
  justify-content: center;
}
.growing_spacer {
  flex-grow: 1;
}

.pdf_wrapper{
  padding: 1em;
  margin-top: 1em;
  border: 1px solid #444444;
  border-radius: 5px;
}

.pdf_container {
  position: relative;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.new_hanko {
  position: absolute;
  z-index: 2;
}

.new_hanko_overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}
</style>
