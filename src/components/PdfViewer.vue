<template>

  <v-card outlined>
    <v-toolbar flat>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">

            <span
              v-bind="attrs"
              v-on="on">
              ① PDFにハンコを押す
            </span>
            <!-- <span>申請削除 / Delete</span> -->
        </template>
        <span>ハンコを押したい所をクリックしてください</span>
      </v-tooltip>


      <v-spacer/>

      <v-btn
        @click="previous_page()"
        :disabled="page_number <= 0"
        icon>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-menu
        open-on-hover
        offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            text
            v-bind="attrs"
            v-on="on">
            {{page_number +1}}/{{page_count}}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="page in Array.from(Array(page_count).keys())"
            :key="page"
            @click="page_number = page">
            <v-list-item-title>{{ page+1 }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        @click="next_page()"
        :disabled="(page_number+1) >= page_count"
        icon>
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>

      <v-spacer/>

      <v-menu
        v-if="current_user_can_stamp"
        :close-on-content-click="false"
        open-on-hover
        offset-y
        z-index="3">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            text
            class="mr-2"
            v-bind="attrs"
            v-on="on">
            <v-icon>mdi-resize</v-icon>
            <span>ハンコサイズ / Stamp size</span>

          </v-btn>
        </template>

        <v-card>
          <v-sheet class='pt-16 px-5'>
            <v-slider
              v-model.number="hanko_scale_slider_value"
              min="1"
              max="100"
              step="2"
              thumb-label="always"/>
          </v-sheet>

        </v-card>

      </v-menu>

      <v-btn
        v-if="current_recipient_is_current_user"
        text
        color="#c00000"
        @click="$emit('reject')">
        <v-icon>mdi-close</v-icon>
        <span>却下 / Reject</span>
      </v-btn>


      <v-btn
        text
        @click="download_pdf()">
        <v-icon>mdi-download</v-icon>
        <span>ダウンロード / Download</span>
      </v-btn>


    </v-toolbar>
    <v-divider/>

    <template v-if="shown_pdf">

      <div
        class="pdf_container"
        ref="pdf_container"
        @click="pdf_clicked($event)">

        <pdf
          :src="pdf_src"
          :page="page_number+1"
          :rotate="rotation"
          @num-pages="page_count_event"/>

        <!-- Used to react to mouse motion over the PDF -->
        <!-- Not sure why it doesn't work when using events on pdf container -->
        <div
          class="new_hanko_overlay"
          @mouseleave="hide_new_hanko()"
          @mousemove="update_new_hanko_position($event)"/>

        <!-- Indicator of where the hanko will be set -->
        <div
          v-if="current_user_can_stamp"
          :style="new_hanko.style"
          class="new_hanko"/>

      </div>

    </template>

    <v-progress-linear
      v-if="loading"
      indeterminate>
    </v-progress-linear>


    <div
      v-if="load_error"
      class="error_message"
      v-html="load_error">
    </div>
  </v-card>


</template>

<script>
import { PDFDocument } from 'pdf-lib'
import pdf from 'vue-pdf'
import canvg from 'canvg' // used to turn Hankos into PNG so as to include them in the pdf



export default {
  name: 'PdfViewer',
  components: {
    pdf
  },
  props: {
    application: Object,
  },

  data () {
    return {
      load_error: null,
      loading: false,

      page_number: 0,
      page_count: 1,
      rotation: 0,

      pdfDoc: null,
      shown_pdf: null,

      // Related to hankos
      new_hanko: {
        style: {
          visibility: 'none'
        }
      },

      hanko_scale_slider_value: 35
      //hanko_scale: 0.035

    }
  },
  mounted () {
    if (this.file_id) {
      this.view_pdf(this.file_id)
    }

    this.restore_hanko_size()
  },
  watch: {
    file_id () {
      this.view_pdf(this.file_id)
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
      .then(({data}) => { this.load_pdf(data) })
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
        file_id: this.file_id,
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
      this.view_pdf(this.file_id)
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
              if (hanko.file_id !== this.file_id) return resolve()

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
      .then(() =>  this.pdfDoc.save())
      .then( (saved_pdf) => { this.shown_pdf = saved_pdf} )
      .catch(error => {
        console.error(error)
      })
      .finally(() => {this.loading = false})
    },

    download_pdf () {
      const pdf_blob = new Blob([this.shown_pdf], { type: 'application/pdf' })

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(pdf_blob, `${this.file_id}.pdf`)
      }
      else {
        const elem = window.document.createElement('a')
        elem.href = window.URL.createObjectURL(pdf_blob)
        elem.download = `${this.file_id}.pdf`
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
    file_id(){
      // Maybe not ideal
      const found_field = this.application.properties.form_data
        .find(field => field.type === "pdf" || field.type === "file")
      return found_field.value
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
      return this.current_recipient.identity === this.$store.state.current_user.identity
    },
    current_user_as_recipient(){
      const current_user = this.$store.state.current_user
      return this.application.recipients.find(recipient => recipient.identity === current_user.identity)
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

.pdf_container {
  position: relative;
}

.new_hanko {
  position: absolute;

  z-index: 2;
  border: 3px solid #c00000;

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





</style>
