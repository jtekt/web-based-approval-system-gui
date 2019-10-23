<template>
  <svg viewBox="0 0 100 100">

    <path
      id="curve"
      d="M0,50a50,50 0 1,0 100,0a50,50 0 1,0 -100,0"
      fill="transparent"
    />

    <text>
      <textPath alignment-baseline="top" class="ring" xlink:href="#curve">
        1111000101101101101010000111011110111100100010111010110011010010011011000101111111010001000010110001101011111011110111011011001001111100010110000101010010100010000000111101110000001100111101000111110001001110111010011010011101001000001001111000100000110100001011000111110010011000011100011010110001011001001100100101011011001111110100011110011110001101110111110011100101101111111000100001100110111111101100011100101110000011000000101101111101111011011111111100010011101100111001100101101001110001011101011111100011101100001100110011011011100110100001110010011011001011101001110110010011111010001111101000001100110111010011101111110101111111100101010111101010111101110111011011001001101100111010100111010001110100010001010101111111000111011010101001001000001001001101101100000111011001111001011010110100100110000101001001110110010001100001110111010011100000100100000010010101000001000111111101100000100100001100010000000111101101110010001111001110100001000101101111010101011101000001101001011110110000
      </textPath>
    </text>

    <!-- if name horizontal, needs to be reversed -->
    <text class="name" v-bind:font-size="name_font_size"  x="50%" y="62%">{{name.split("").reverse().join("")}}</text>

    <line x1="15" y1="77" x2="85" y2="77"/>

    <text class="date" x="50%" y="88">{{String(date.year.low).slice(2,4)}}.{{date.month.low}}.{{date.day.low}}</text>

  </svg>
</template>

<script>
export default {
  name: 'Inkan',
  props: {
    name: String,
    date: Object,
  },
  computed: {
    name_font_size: function(){
      return 80/this.name.length
    },
  },
  methods: {
    inkan_clicked: function(){
      alert("clicked")
    }
  }


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

svg{
  fill: #00aa00;
  cursor: pointer;
}

svg .name {
  font-weight: 700;
  text-anchor: middle;

  /* monospace needed because font size depends on number of characters */
  font-family: monospace, monospace;
}

svg .ring {
  font-size: 4pt;
  font-weight: bold;
  font-family: Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace;

}

svg .date {
  font-size: 8pt;
  font-weight: bold;
  text-anchor: middle;
  font-family: monospace;
}

svg line{
  stroke: #00aa00;
  stroke-width:0.5;
}
</style>
