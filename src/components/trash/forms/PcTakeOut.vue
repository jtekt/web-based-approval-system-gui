<template>
  <div>
    <FormAutoGen v-bind:fields.sync="form_data"/>
  </div>
</template>

<script>
import FormAutoGen from '@/components/FormAutoGen.vue'

export default {
  name: 'PcTakeOut',
  components: {
    FormAutoGen,
  },
  data(){
    return {
      form_data: [
        {type: "text", label: "PC no."},
        {type: "text", label: "利用場所持出先 / Destination"},
        {type: "text", label: "使用目的 / Reason"},
        {type: "date", label: "持出定日 / Takeout date"},
        {type: "date", label: "返却予定日 / Bring back date"},
      ]
    }
  },
}
</script>
