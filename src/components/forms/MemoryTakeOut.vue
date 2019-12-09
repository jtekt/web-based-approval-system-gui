<template>
  <div>
    <FormAutoGen v-bind:fields.sync="form_data"/>
  </div>
</template>

<script>
import FormAutoGen from '@/components/FormAutoGen.vue'

export default {
  name: 'MemoryTakeOut',
  components: {
    FormAutoGen,
  },
  data(){
    return {
      form_data: [
        {type: "text", label: "メモリー番号"},
        {type: "text", label: "利用場所持出先"},
        {type: "text", label: "データの内容"},
        {type: "text", label: "使用目的"},
        {type: "date", label: "持出予定日"},

      ]
    }
  },
}
</script>
