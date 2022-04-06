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
      <!-- warning: translation is in the original reference frame (before scaling) -->
      <!-- 100/21*0.8 = 3.80952380952 -->
      <path
        v-bind:d="qr_code_svg"
        stroke="#c00000"
        :transform="transform"/>

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
        {{date_formatted}}
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
    approvalId: { type: String, default: '1' },
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
      qr_code_svg: '',
      qr_size: 21,
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
    },
    date_formatted(){
      return `${this.date.year.toString().slice(2,4)}.${this.date.month}.${this.date.day}`
    },
    transform(){

      // Target size: 80 x 80
      // Current size: this.qr_size
      // original qr is 21 x 21, resizing to 80 x 80
      // Margin: 1-px on each side
      // Margin will depend on size

      const scale = 0.8 * 100/this.qr_size
      const margin = {
        x: 10/scale,
        y: 40/scale,

      }

      return `
        scale(${scale})
        translate(${margin.x},${margin.y})
      `
    },
  },
  methods: {
    generate_qr () {
      const content = this.approvalId.toString()
      const options = {
        margin: 0,
        color: {
          dark: '#C00000', // Dots: Red
          light: '#0000' // Transparent background
        }
      }

      QRCode.toString(content, options)
      .then( (qr_string) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(qr_string, 'image/svg+xml')
        this.qr_code_svg = doc.getElementsByTagName('path')[0].getAttribute('d')
        this.qr_size = doc.getElementsByTagName('svg')[0].getAttribute('viewBox').split(' ')[2]
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
