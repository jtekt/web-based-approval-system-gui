<template>
  <div class="pdf_wrapper">
    <h1>PDF viewer</h1>

    <template v-if="shown_pdf">
      <div class="pdf_actions_wrapper">

        <button
          type="button"
          @click="previous_page()"
          :disabled="page_number <= 0">
          <arrow-left-icon/>
        </button>

        <select
          class=""
          v-model="page_number">
          <option
            v-for="n in page_count"
            :key="`page_${n}`"
            :value="n-1">
            {{n}}
          </option>
        </select>

        <button
          type="button"
          @click="download_pdf()">
          <download-icon/>
          <span>Download (ハンコあり)</span>
        </button>

        <div class="hanko_size_wrapper">
          <label>Hanko size:</label>
          <input
            type="range"
            v-model.number="hanko_scale_slider_value"
            min="1"
            max="100"
            step="2">
        </div>

        <button
          type="button"
          @click="next_page()"
          :disabled="(page_number+1) >= page_count">
          <arrow-right-icon/>
        </button>

      </div>

      <div
        class="pdf_container"
        ref="pdf_container"
        @click="pdf_clicked($event)">

        <pdf
          :page="page_number+1"
          :src="pdf_src"
          :rotate="rotation"
          @num-pages="page_count_event"/>

        <div
          class="new_hanko_overlay"
          @mouseleave="hide_new_hanko()"
          @mousemove="update_new_hanko_position($event)"/>

        <!-- Indicator of where the hanko will be set -->
        <div
          v-if="current_user_can_stamp"
          v-bind:style="new_hanko.style"
          class="new_hanko"/>

      </div>

    </template>

    <div
      class="loader_wrapper"
      v-if="loading">
      <Loader >Loading PDF</Loader>
    </div>

    <div
      v-if="load_error"
      class="error_message"
      v-html="load_error">
    </div>

  </div>
</template>

<script>
import { PDFDocument } from 'pdf-lib'
import pdf from 'vue-pdf'
import canvg from 'canvg' // used to turn Hankos into PNG so as to include them in the pdf

import CurrentUserID from '@/mixins/CurrentUserID.js'

export default {
  name: 'PdfViewer',
  components: {
    pdf
  },
  props: {
    application: Object,
    selected_file_id: String,
  },
  mixins: [
    CurrentUserID
  ],
  data () {
    return {
      load_error: null,
      loading: false,

      // Pages data
      page_number: 0,
      page_count: 1,
      rotation: 0,

      pdfDoc: null,
      shown_pdf: null,

      new_hanko: {
        style: {
          visibility: 'none'
        }
      },

      hanko_scale_slider_value: 35,

      //hanko_scale: 0.034
    }
  },
  mounted () {
    if (this.selected_file_id) {
      this.view_pdf(this.selected_file_id)
    }

    this.restore_hanko_size()
  },
  watch: {
    selected_file_id () {
      this.view_pdf(this.selected_file_id)
    },
    page_number () {
      this.set_pdf_rotation()
    }
  },
  methods: {
    page_count_event (page_count) {
      if (page_count) this.page_count = page_count
    },
    next_page () {
      if (this.page_number + 1 < this.page_count) this.page_number++
    },
    previous_page () {
      if (this.page_number > 0) this.page_number--
    },

    view_pdf (file_id) {
      // Check if IE
      if (!!window.MSInputMethodContext && !!document.documentMode) {
        this.load_error = 'Internet Explorer is to old for this feature'
        alert('Internet Explorerのユーザーはこの機能に値しません、今の時代のブラウザを使ってください。')
        return
      }

      this.loading = true

      // reset the file
      this.shown_pdf = null

      // Reset page number
      this.page_number = 0

      // Load the file as an arrayBuffer
      // Note: could be done using axios
      const file_url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/files/${file_id}`
      const axios_options = { responseType: 'arraybuffer' }

      this.axios.get(file_url, axios_options)
      .then(({data}) => {
        this.load_pdf(data)
      })
      .catch((error) => {
        if(error.response) console.error(error.response.data)
        else console.error(error)
      })

    },
    set_pdf_rotation(){
      const pages = this.pdfDoc.getPages()
      const current_page = pages[this.page_number]
      const {angle} = current_page.getRotation()
      this.rotation = - angle
    },
    async load_pdf (buffer) {
      this.load_error = null
      try {
        this.pdfDoc = await PDFDocument.load(buffer)
        this.set_pdf_rotation()
        this.load_pdf_hankos()
      }
      catch (e) {
        this.load_error = `この機能は.pdfのファイルしかつかえません<br>This feature only supports .pdf files`
      }
    },

    restore_hanko_size(){
      const {hanko_size} = localStorage
      if(hanko_size) this.hanko_scale_slider_value = hanko_size
    },

    save_hanko_size(){
      localStorage.hanko_size = this.hanko_scale_slider_value
    },


    async pdf_clicked (event) {

      if(!this.current_user_can_stamp) return
      if (!confirm(`Apply Hanko here?`)) return

      this.save_hanko_size()

      const pages = this.pdfDoc.getPages()
      const page = pages[this.page_number]
      const { width, height } = page.getSize()

      const wrapper_width = this.$refs.pdf_container.offsetWidth
      const click_x = event.offsetX || event.layerX
      const position_x = width * (click_x / wrapper_width)

      const wrapper_height = this.$refs.pdf_container.offsetHeight
      const click_y = event.offsetY || event.layerY
      const position_y = height - (height * (click_y / wrapper_height))

      const new_hanko = {
        file_id: this.selected_file_id,
        page_number: this.page_number,
        position: {
          x: position_x,
          y: position_y
        },
        scale: this.hanko_scale
      }

      const current_user_as_recipient = this.current_user_as_recipient
      const approval = current_user_as_recipient.approval
      if(!approval) return this.approve_application({attachment_hankos: [new_hanko]})

      let attachment_hankos = approval.properties.attachment_hankos
      if(!attachment_hankos) attachment_hankos = []
      if (typeof attachment_hankos === 'string') {
        attachment_hankos = JSON.parse(attachment_hankos)
      }
      attachment_hankos.push(new_hanko)

      this.update_hankos(approval.identity, {attachment_hankos})

    },

    approve_application(body){
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/approve`
      this.axios.post(url, body)
      .then(() => {
        this.$emit('pdf_stamped')
      })
      .catch((error) => {
        console.error(error)
        alert(`Error approving application`)
      })
    },

    update_hankos(approval_id, body){
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/approvals/${approval_id}/attachment_hankos`

      this.axios.put(url, body)
      .then(() => {
        this.$emit('pdf_stamped')
      })
      .catch((error) => {
        console.log(error)
        alert(`Error approving application`)
      })
    },

    refresh_pdf () {
      this.shown_pdf = null
      this.view_pdf(this.selected_file_id)
    },

    update_new_hanko_position (event) {

      // Getting the size of the page
      //const wrapper_width = this.$refs.pdf_container.offsetWidth
      const wrapper_height = this.$refs.pdf_container.offsetHeight

      const pages = this.pdfDoc.getPages()
      const page = pages[this.page_number]
      const {height: page_height } = page.getSize()


      const hanko_height = 1500 * this.hanko_scale * wrapper_height / page_height


      this.new_hanko.style = {
        left: `calc(${event.offsetX}px - 0.5 * ${this.new_hanko.style.width})`,
        top: `calc(${event.offsetY}px - 0.5 * ${this.new_hanko.style.height})`,
        height: `${hanko_height}px`,
        width: `${0.75 * hanko_height}px`,
        'border-radius': `${0.1 * hanko_height}px`,
        'border-width': `${0.03 * hanko_height}px`
      }
    },

    hide_new_hanko () {
      this.new_hanko.style = { visibility: 'none' }
    },

    get_hanko_blob_url_from_id(hanko_dom_id){
      const hanko_svg = document.getElementById(hanko_dom_id)

      const serializer = new XMLSerializer()
      const SVG_sata = serializer.serializeToString(hanko_svg)

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = 1000
      canvas.height = 1500

      canvg.fromString(context, SVG_sata).start()

      return canvas.toDataURL("image/png");
    },

    load_pdf_hankos () {

      const promises = []

      this.application.recipients
      .filter(recipient => !!recipient.approval)
      .map(recipient => recipient.approval)
      .forEach(approval => {

        const promise = new Promise( (resolve, reject) => {

          // Do nothing if there no hanko to draw for the current approval
          let hankos = approval.properties.attachment_hankos
          //if (!hankos) return
          if (!hankos) return resolve()

          if (typeof hankos === 'string') hankos = JSON.parse(hankos)

          const png_url = this.get_hanko_blob_url_from_id(`hanko_${approval.identity}`)

          const axios_options = { responseType: 'arraybuffer' }

          this.axios.get(png_url, axios_options)
          .then( ({data}) => this.pdfDoc.embedPng(data) )
          .then( (pngImage) => {
            // The PNG is now awvailable to display at every hanko location

            const pages = this.pdfDoc.getPages()

            hankos.forEach( hanko => {

              // Skip if hanko is not part of the current file
              if (hanko.file_id !== this.selected_file_id) return resolve()

              const page = pages[hanko.page_number]

              // Currently, some hankos have no scale set so allow the scale to be modified using the slider in that case
              const pngDims = pngImage.scale(hanko.scale || this.hanko_scale)

              const drawing_parameters = {
                x: hanko.position.x - 0.5 * pngDims.width,
                y: hanko.position.y - 0.5 * pngDims.height,
                width: pngDims.width,
                height: pngDims.height
              }

              // This seems to be a synchronous function
              page.drawImage(pngImage, drawing_parameters)
            })

            resolve()

          })
          .catch(reject)
        })

        promises.push(promise)
      })

      // render .pdf once all hankos of all approvals have been drawn
      Promise.all(promises)
      .then(() =>  this.pdfDoc.save() )
      .then( (saved_pdf) => { this.shown_pdf = saved_pdf })
      .catch(error => {
        alert('Something went wrong while loading the PDF')
        console.error(error)
      })
      .finally(() => { this.loading = false })
    },

    download_pdf () {
      const pdf_blob = new Blob([this.shown_pdf], { type: 'application/pdf' })

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(pdf_blob, `${this.selected_file_id}.pdf`)
      }
      else {
        const elem = window.document.createElement('a')
        elem.href = window.URL.createObjectURL(pdf_blob)
        elem.download = `${this.selected_file_id}.pdf`
        document.body.appendChild(elem)
        elem.click()
        document.body.removeChild(elem)
      }
    }
  },
  computed: {
    pdf_src(){
      const pdf_blob = new Blob([this.shown_pdf], { type: 'application/pdf' })

      const src =  pdf.createLoadingTask({
        url: window.URL.createObjectURL(pdf_blob),
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/cmaps/',
        cMapPacked: true,
      })

      return src
    },
    application_id(){
      return this.application.identity
    },
    application_has_refusal(){
      return this.application.recipients.find(recipient => recipient.refusal)
    },
    current_recipient(){
      // recipients sorted by flow index apparently

      return this.application.recipients
      .slice()
      .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
      .find(recipient => !recipient.approval && !recipient.refusal)
    },
    current_recipient_is_current_user(){
      if(!this.current_recipient) return false
      const current_user_id = this.$store.state.current_user.identity.low || this.$store.state.current_user.identity
      return this.current_recipient.identity === current_user_id
    },
    current_user_as_recipient(){
      const current_user_id = this.$store.state.current_user.identity.low || this.$store.state.current_user.identity
      return this.application.recipients.find(recipient => recipient.identity === current_user_id)
    },

    current_user_can_stamp(){

      /*
      Application can be stamped if:
      - User is recipient
      - The application has not been rejectred by anyone
      - it's user's flow index or above
      */


      if(!this.current_user_as_recipient) return false
      if(this.application_has_refusal) return false

      const current_flow_index = this.current_recipient
        ? this.current_recipient.submission.properties.flow_index
        : this.application.recipients.length

      const current_user_flow_index = this.current_user_as_recipient.submission.properties.flow_index

      return current_user_flow_index <= current_flow_index
    },
    hanko_scale(){
      return this.hanko_scale_slider_value / 1000
    }
  }
}
</script>

<style scoped>
.pdf_wrapper{
  padding: 1em;
  margin-top: 1em;
  border: 1px solid #444444;
  border-radius: 5px;
}

.pdf_container {
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  border: 1px solid #dddddd;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.new_hanko {
  position: absolute;

  z-index: 2;
  border: 3px solid #c00000;
  border-radius: 10px;
}

.new_hanko_overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  cursor: pointer;
}

.pdf_actions_wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

}

.pdf_actions_wrapper > * {
  margin: 1em;
}

.disabled {
  color: #aaaaaa;
}

.clickable {
  cursor: pointer;
}

.loader_wrapper {
  text-align: center;
}

.hanko_size_wrapper {
  display: flex;
  align-items: center;
}

.hanko_size_wrapper label {
  margin-right: 0.5em;
}

</style>
