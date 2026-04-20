<template>
    <div class="web_hanko" v-html="svg" />
</template>

<script>
import { generateWebHankoSvg } from '@/utils/webHankos.js'

export default {
    name: 'WebHanko',
    props: {
        recipient: { type: Object },
    },

    computed: {
        svg() {
            return generateWebHankoSvg(this.recipient)
        },
    },
    methods: {},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.web_hanko {
    position: relative;

    /* the SVG will keep aspect ratio and generate margins accordingly */
    height: 100%;
    width: 100%;
}

.web_hanko > svg {
    height: 100%;
    width: 100%;
}
</style>
