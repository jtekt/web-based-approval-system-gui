<template>
  <div class="pdf_wrapper">
    <h1>PDF viewer</h1>

    <template v-if="shown_pdf"->
      <p
        class="error_message"
        v-if="!approval_of_current_user">
        申請が承認された時、資料にハンコを押すようになります / This document can be stamped once the application is approved.
      </p>
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
          :value="n-1">{{n}}</option>
        </select>

        <button
          type="button"
          @click="download_pdf()">
          <download-icon/>
          <span>Download (with ハンコ)</span>
        </button>

        <div class="hanko_size_wrapper">
          <label>Hanko size:</label>
          <input
            type="range"
            v-model.number="hanko_scale"
            min="0.01"
            max="0.1"
            step="0.005"
            @change="resize_hankos()">
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
          :src="shown_pdf"
          @num-pages="page_count_event"/>

        <div
          class="new_hanko_overlay"
          @mouseleave="hide_new_hanko()"
          @mousemove="update_new_hanko_position($event)"/>

        <!-- Indicator of where the hanko will be set -->
        <div
          v-if="approval_of_current_user"
          v-bind:style="new_hanko.style"
          class="new_hanko"/>

      </div>

    </template>

    <div
      class="loader_wrapper"
      v-if="!shown_pdf && !load_error">
      <Loader >Loading PDF</Loader>
    </div>


    <div
      v-if="load_error"
      class="error_message" >
      {{load_error}}
    </div>

  </div>
</template>

<script>
import { PDFDocument } from 'pdf-lib';
import pdf from 'vue-pdf'
import Canvg from 'canvg'

export default {
  name: 'PdfViewer',
  components: {
    pdf,
  },
  props: {
    selected_file_id: String,
    approvals: Array,
    application_id: Number,
  },
  data(){
    return {
      load_error: null,
      loading: false,

      page_number: 0,
      page_count: 1,

      pdfDoc: null,
      shown_pdf: null,

      new_hanko: {
        style: {
          visibility: 'none',
        }
      },

      hanko_scale: 0.034,
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
    approvals() {
      this.view_pdf(this.selected_file_id)
    }
  },
  methods: {
    page_count_event(page_count){
      if(page_count) this.page_count = page_count
    },
    next_page(){
      if(this.page_number+1 < this.page_count) this.page_number ++
    },
    previous_page(){
      if(this.page_number > 0) this.page_number --
    },
    view_pdf(file_id){

      // Check if IE
      if (!!window.MSInputMethodContext && !!document.documentMode) {
        this.load_error = 'Internet Explorer is to old for this feature'
        alert('Internet Explorerのユーザーはこの機能に値しません、今の時代のブラウザを使ってください。')
        return
      }

      // reset the file
      this.shown_pdf = null

      // Reset page number
      this.page_number = 0

      // Load the file as an arrayBuffer
      let file_url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/files/${file_id}`
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

      if(success) this.load_pdf_hankos()

    },

    svg_to_png_url(svg){

      return new Promise( (resolve, reject) => {
        let SVG_sata = (new XMLSerializer()).serializeToString(svg)
        let canvas = document.createElement('canvas')
        canvas.width = 1000
        canvas.height = 1500

        Canvg(canvas, SVG_sata, {
          renderCallback: () => {

            let png_URL = canvas
              .toDataURL('image/png')
              .replace('image/png', 'image/octet-stream')

            resolve(png_URL)
          }
        })
      })

    },

    async load_pdf_hankos(){

      // using promises to only save the pdf when all hankos are drawn
      let promises = []

      // For each recipient
      this.approvals.forEach(async (approval) => {

        // using promises to only save the pdf when all hankos are drawn
        let promise = new Promise ( async(resolve, reject) => {
          if(!approval) return resolve()
          if(!approval.properties.attachment_hankos) return resolve()

          // Parse attachment hankos if not JSON already
          if(typeof approval.properties.attachment_hankos === 'string') {
            approval.properties.attachment_hankos = JSON.parse(approval.properties.attachment_hankos)
          }

          // Get the hanko's svg
          const hanko_svg = document.getElementById(`hanko_${approval.identity.low}`)

          // Convert the hanko's svg into a png URL
          // FIREFOX PROBLEM HERE!
          const png_url = await this.svg_to_png_url(hanko_svg).then((png_url) => {return png_url})

          // Get the png image bytes from the canvas
          const pngImageBytes = await fetch(png_url).then((res) => {return res.arrayBuffer()})
          const pngImage = await this.pdfDoc.embedPng(pngImageBytes)
          const pngDims = pngImage.scale(this.hanko_scale)

          const pages = this.pdfDoc.getPages()

          // Draw every hanko
          approval.properties.attachment_hankos.forEach(async (hanko) => {
            // Skip if hanko is not part of the current file
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

      const wrapper_width = this.$refs.pdf_container.offsetWidth
      const wrapper_height = this.$refs.pdf_container.offsetHeight
      const scaling = 1.735 * this.hanko_scale

      this.new_hanko.style = {
        left: `calc(${event.offsetX}px - 0.5 * ${this.new_hanko.style.width})`,
        top: `calc(${event.offsetY}px - 0.5 * ${this.new_hanko.style.height})`,
        width: `${scaling * wrapper_width}px`,
        height: `${scaling * wrapper_height}px`,
      }

    },

    hide_new_hanko(){
      this.new_hanko.style= { visibility: 'none' }
    },
    async pdf_clicked(event){

      //return alert('研究企画が官僚的な考え方をやめてくれないとこの機能を使えないようにします')

      let approval = this.approval_of_current_user
      if(!approval) return
      let approval_id = approval.identity.low

      // Using a timeout so as to let time to Hanko to appear before showing the alert
      setTimeout(() => {
        if(!confirm(`Apply Hanko here?`)) return

        const pages = this.pdfDoc.getPages()
        const page = pages[this.page_number]
        const { width, height } = page.getSize()

        const wrapper_width = this.$refs.pdf_container.offsetWidth
        const click_x = event.offsetX || event.layerX
        const position_x = width * (click_x/wrapper_width)

        const wrapper_height = this.$refs.pdf_container.offsetHeight
        const click_y = event.offsetY || event.layerY
        const position_y = height - (height * (click_y/wrapper_height))

        // Create a list of attachment hankos if they don't exist yet
        if(!approval.properties.attachment_hankos) {
          approval.properties.attachment_hankos = []
        }

        let attachment_hanko = {
          file_id: this.selected_file_id,
          page_number: this.page_number,
          position: {
            x: position_x,
            y: position_y,
          }
        }



        approval.properties.attachment_hankos.push(attachment_hanko)

        let url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/approvals/${approval_id}`

        this.axios.put(url, { attachment_hankos: approval.properties.attachment_hankos })
        .then((response) => {
          this.refresh_pdf()
          this.hide_new_hanko()

        })
        .catch((error) => {
          console.log(error)
          alert(error)
        })

      }, 50)


    },

    refresh_pdf(){
      this.shown_pdf = null
      this.view_pdf(this.selected_file_id)
    },

    resize_hankos(){
      let approvals_with_hanko = this.approvals.filter(approval => {
        return !!approval.properties.attachment_hankos
      })
      if(approvals_with_hanko.length > 0) this.refresh_pdf()
    },
    download_pdf(){

      let pdf_blob = new Blob([this.shown_pdf], { type: 'application/pdf' })

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(pdf_blob, `${this.selected_file_id}.pdf`);
      }
      else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(pdf_blob);
        elem.download = `${this.selected_file_id}.pdf`;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }


    }
  },
  computed: {
    approval_of_current_user(){

      return this.approvals.find(approval => {
        return JSON.stringify(approval.start) === JSON.stringify(this.$store.state.current_user.identity)
      })

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
