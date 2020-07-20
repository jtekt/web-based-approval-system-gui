<template>

  <div class="web_hanko">
    <svg
      :id="`hanko_${approvalId}`"
      ref="svg"
      viewBox="0 0 100 150">

      <!-- frame -->
      <rect
        stroke="#c00000"
        stroke-width="2"
        fill-opacity="0.0"
        x="2%" y="2%" rx="10" ry="10"
        width="96%" height="96%"/>

        <!-- Approver name -->
      <text
        fill="#c00000"
        text-anchor="middle"
        font-family="monospace, monospace"
        font-weight="600"
        v-bind:font-size="name_font_size"
        x="50%" y="20%">
        {{name}}
      </text>

      <!-- original qr is 21 x 21, resizing to 80 x 80 -->
      <!-- warning: ranslation is in the original reference frame (before scaline) -->
      <!-- 100/21*0.8 = 3.80952380952 -->
      <path
        v-bind:d="qr_code_svg"
        stroke="#c00000"
        transform="
          scale(3.80952380952)
          translate(2.625,10.5)
        "/>

        <!-- Lines above and below the QR code -->
      <line
        stroke="#c00000"
        stroke-width="1"
        x1="5%" y1="36" x2="95%" y2="36"/>
      <line
        stroke="#c00000"
        stroke-width="1"
        x1="5%" y1="125" x2="95%" y2="125"/>

      <!-- date of approval -->
      <text
        fill="#c00000"
        text-anchor="middle"
        font-family="monospace, monospace"
        font-size="14"
        x="50%" y="94%">
        {{String(date.year.low).slice(2,4)}}.{{date.month.low}}.{{date.day.low}}
      </text>

    </svg>

    <div
      class="download_button_container"
       v-on:click="download()">
      <download-icon/>
    </div>

  </div>

</template>

<script>
import QRCode from 'qrcode'
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import Canvg from 'canvg'

export default {
  name: 'WebHanko',
  props: {
    name: { type: String, default: '名前' },
    approvalId: { type: Number, required: false },
    date: {
      type: Object,
      default () {
        return {
          year: { low: 2000 },
          month: { low: 1 },
          day: { low: 1 } }
      }
    }
  },
  components: {
    DownloadIcon,
  },
  data () {
    return {
      qr_code_svg: ''
    }
  },
  mounted () {
    QRCode.toString(String(this.approvalId), {
      margin: 0,
      color: {
        dark: '#C00000', // Dots
        light: '#0000' // Transparent background
      }
    })
      .then(string => {
        var parser = new DOMParser()
        var doc = parser.parseFromString(string, 'image/svg+xml')
        this.qr_code_svg = doc.getElementsByTagName('path')[0].getAttribute('d')
      })
      .catch(err => console.error(err))
  },
  computed: {
    name_font_size: function () {
      return 55 / this.name.length
    }
  },
  methods: {

    async download () {
      if (!!window.MSInputMethodContext && !!document.documentMode) {
        return alert('IE11 is too old for this feature. please use a browser of this era, such as Google Chrome, Mozilla Firefox or Microsoft Edge')
      }

      let SVG_sata = (new XMLSerializer()).serializeToString(this.$refs.svg)
      let canvas = document.createElement('canvas')
      canvas.width = 1000
      canvas.height = 1500

      Canvg(canvas, SVG_sata, {
        renderCallback: () => {
          canvas.toBlob( (blob) => {
            this.actual_download(`${this.approvalId}.png`,blob)
          })
        }
      })

    },
    actual_download(filename, blob ) {
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      }
      else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.web_hanko{

  position: relative;

  /* the SVG will keep aspect ratio and generate margins accordingly */
  height: 100%;
  width: 100%;

}

svg {
  height: 100%;
  width: 100%;
}

.download_button_container{
  opacity: 0;
  transition: opacity 0.25s;

  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #c00000;
  background-color: #ffffffdd;
  cursor: pointer;
}

.download_button_container:hover {
  opacity: 1;
}



</style>
