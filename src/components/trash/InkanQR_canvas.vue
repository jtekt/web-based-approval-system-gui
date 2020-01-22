<template>
  <canvas id="canvas" width="200" height="200"></canvas>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'Inkan',
  props: {
    name: String,
    approval_id: Number,
    date: Object,
  },
  mounted: function(){


    QRCode.toCanvas(document.getElementById('canvas'),String(this.approval_id),{
    margin: 1,
    color: {
        dark: '#C00000',  // Blue dots
        light: '#0000' // Transparent background
      }
    })
    .then(url => {
      this.draw_rest_of_canvas()
    })
    .catch(err => {
      console.error(err)
    })
  },
  computed: {

  },
  methods: {
    draw_rest_of_canvas(){
      var canvas = document.getElementById('canvas');
      var ctx = canvas.getContext("2d");

      canvas.height

      ctx.beginPath();
      ctx.arc(95, 50, 40, 0, 2 * Math.PI);
      ctx.stroke();

    }
  }


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

canvas{
  outline: 2px solid red;
}

</style>
