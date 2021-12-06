<template>

  <div class="web_hanko">
    <!-- ID used for PDF stamping -->
    <!-- This is far from ideal -->
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
        :font-size="name_font_size"
        x="50%"
        :y="name_y">
        {{name}}
      </text>

      <!-- original qr is 21 x 21, resizing to 80 x 80 -->
      <!-- warning: translation is in the original reference frame (before scaline) -->
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
        {{String(date.year).slice(2,4)}}.{{date.month}}.{{date.day}}
      </text>

    </svg>

  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'WebHanko',
  props: {
    name: { type: String, default: '名前' },
    approvalId: { type: Number, default: 1 },
    date: {
      type: Object,
      default () {
        return {
          year: 0,
          month: 0,
          day: 0
        }
      }
    }
  },
  data () {
    return {
      qr_code_svg: ''
    }
  },
  mounted () {
    this.generate_qr()
  },
  computed: {
    name_font_size () {
      return Math.min(55 / this.name.length, 55 / 2)
    },
    name_y () {
      return 17.5 + 0.5 * this.name_font_size
    }
  },
  methods: {
    generate_qr () {
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

  font-size: 200%;

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
