<template>
  <div>
    <FormAutoGen v-bind:fields.sync="form_data"/>
  </div>
</template>

<script>
import FormAutoGen from '@/components/FormAutoGen.vue'

export default {
  name: 'ReceiptPurchaseBefore',
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
        {type: "checkbox", label: "買入依頼による手配ができない / Cannot use the company purchasing system"},
        {type: "checkbox", label: "請求書処理を優先して検討した / Cannot purchase via invoice"},
        {type: "checkbox", label: "説明資料 / Explanation material available?"},

      ]
    }
  },
}
</script>
