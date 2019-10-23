<template>

  <div class="inkan">

    <canvas ref="canvas" width="100"></canvas>

    <svg
      ref="svg"
      v-on:click="download()"
      viewBox="0 0 100 150"
      >

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
        font-size="90%"
        x="50%" y="94%">
        {{String(date.year.low).slice(2,4)}}.{{date.month.low}}.{{date.day.low}}
      </text>

    </svg>

  </div>

</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'Inkan',
  props: {
    name: {type: String, default: "AA"},
    approval_id: {type: Number, default: 1},
    date: {type: Object, default: {year: {low: 2000},month: {low: 1},day: {low: 1},}},
  },
  data: function(){
    return {
      qr_code_svg: "",
    }
  },
  mounted: function(){
    QRCode.toString(String(this.approval_id),{
    margin: 0,
    color: {
        dark: '#C00000',  // Blue dots
        light: '#0000' // Transparent background
      }
    })
    .then(string => {
      var parser = new DOMParser();
      var doc = parser.parseFromString(string, "image/svg+xml");

      this.qr_code_svg = doc.getElementsByTagName("path")[0].getAttribute('d')

    })
    .catch(err => console.error(err))
  },
  computed: {
    name_font_size: function(){
      return 55/this.name.length
    },
  },
  methods: {
    download(){
      var svg = this.$refs.svg;
      var canvas = this.$refs.canvas;
      var ctx = canvas.getContext('2d');
      var data = (new XMLSerializer()).serializeToString(svg);

      var DOMURL = window.URL || window.webkitURL || window;

      var img = new Image();
      var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
      var url = DOMURL.createObjectURL(svgBlob);

      img.onload = function () {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      var imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');

      var evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
      });

      var a = document.createElement('a');
      a.setAttribute('download', 'approval_qr.png');
      a.setAttribute('href', imgURI);
      a.setAttribute('target', '_blank');

      a.dispatchEvent(evt);
    };

    img.src = url;

    },
  },


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

* {
  box-sizing: border-box;
}

svg{
  cursor: pointer;

  /* the SVG will keep aspect ratio and generate margins accordingly */
  height: 100%;
  width: 100%;
}

canvas {
  display: none;
}

</style>
