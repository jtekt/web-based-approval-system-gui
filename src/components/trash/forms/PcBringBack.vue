<template>
  <div>
    <FormAutoGen v-bind:fields.sync="form_data"/>
  </div>
</template>

<script>
import FormAutoGen from '@/components/FormAutoGen.vue'

export default {
  name: 'PcBringBack',
  components: {
    FormAutoGen,
  },
  data(){
    return {
      form_data: [
        {type: "text", label: "申請番号"},
        {type: "text", label: "利用場所持出先"},
        {type: "text", label: "使用目的"},
        {type: "date", label: "持込定日"},
      ]
    }
  },
}
</script>
