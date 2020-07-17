<template>
  <div class="pdf_wrapper">
    <h1>PDF viewer</h1>
    <p>Thanks to 内野さん for suggesting this feature!</p>

    <div class="pdf_download_button">
      <button type="button" @click="download_pdf()">Download</button>
    </div>

    <div
      v-if="shown_pdf"
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

    <div class="" v-if="load_error">
      {{load_error}}
    </div>

  </div>
</template>

<script>
import { PDFDocument } from 'pdf-lib';
import pdf from 'vue-pdf'

export default {
  name: 'PdfViewer',
  components: {
    pdf,
  },
  props: {
    selected_file_id: String,
    recipient_records: Array,
    application_id: Number,
  },
  data(){
    return {
      load_error: null,
      // Stamping pdfs
      pdfDoc: null,
      shown_pdf: null,

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
  mounted(){
    if(this.selected_file_id){
      this.view_pdf(this.selected_file_id)
    }
  },
  watch: {
    // whenever question changes, this function will run
    selected_file_id() {
      this.view_pdf(this.selected_file_id)
    },
    recipient_records() {
      this.view_pdf(this.selected_file_id)
    }
  },
  methods: {
    view_pdf(file_id){

      if (!!window.MSInputMethodContext && !!document.documentMode) {
        this.load_error = 'This feature only supports .pdf files'
        alert('Internet Explorerのユーザーはこの機能に値しません、今の時代のブラウザを使ってください。')
        return
      }

      // TODO: CHANGE THIS URL
      let file_url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/files/${file_id}?application_id=${this.application_id}`
      fetch(file_url, {
        headers: new Headers({
          'Authorization': `Bearer ${this.$cookies.get('jwt')}`,
        }),
      })
      .then((response) => { return response.arrayBuffer() })
      .then((buffer) => { this.load_pdf(buffer) })
    },
    async load_pdf(buffer) {

      this.load_error = null
      let success = true
      try {
        this.pdfDoc = await PDFDocument.load(buffer)
      }
      catch (e) {
        this.load_error = 'This feature only supports .pdf files'
        success = false
      }

      if(success) {
        this.load_pdf_hankos()
        this.set_new_hanko_src()
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
          if(!approval) return resolve()
          if(!approval.properties.attachment_hankos) return resolve()

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
            if(hanko.file_id !== this.selected_file_id) return resolve()

            const page = pages[hanko.page_number]

            await page.drawImage(pngImage, {
              x: hanko.position.x - 0.5 * pngDims.width,
              y: hanko.position.y - 0.5 * pngDims.height,
              width: pngDims.width,
              height: pngDims.height,
            })

            return resolve()

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
      if(!approval) {
        //alert('You need to approve the application before being able to stamp attachments')
        return
      }

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
      if(!approval) {
        alert('You need to approve the application first')
        return
      }


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

      let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/approvals/${approval_id}`

      this.axios.put(url, { attachment_hankos: approval.properties.attachment_hankos })
      .then((response) => {
        this.view_pdf(this.selected_file_id)

      })
      .catch((error) => {
        console.log(error.response.data)
      })
    },
    download_pdf(){

      let pdf_blob = new Blob([this.shown_pdf], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(pdf_blob)
      link.download = 'output'
      link.click()
      URL.revokeObjectURL(link.href)

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

.pdf_download_button {
  text-align: center;
  margin: 1em;

}

</style>
