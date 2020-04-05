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
        {type: "text", label: "事前申請番号 / Application ID"},
        {type: "text", label: "負担部門 / Billed department number"},
        {type: "text", label: "費目 / Objective"},
        {type: "text", label: "金額 / Amount"},
        {type: "checkbox", label: "税込 / Taxe included"},
        {type: "checkbox", label: "領収書（宛名：ジェイテクト）/ JTEKT written on receipt?"},
        {type: "checkbox", label: "購入または参加したことを示すもの / Proof of purchase available?"},
        {type: "file", label: "領収書 / Receipt"},
      ]
    }
  },
}
</script>
