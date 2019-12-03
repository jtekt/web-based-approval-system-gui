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
        {type: "text", label: "目的・理由 / Reason for purchase"},
        {type: "text", label: "購入先 / Vendor"},
        {type: "text", label: "金額 / Amount"},
        {type: "checkbox", label: "税込 / Taxe included"},
      ]
    }
  },
}
</script>
