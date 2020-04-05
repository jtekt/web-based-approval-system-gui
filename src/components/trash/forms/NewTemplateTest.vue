<template>
  <div>
    <FormAutoGen v-bind:fields.sync="form_data"/>
  </div>
</template>

<script>
import FormAutoGen from '@/components/FormAutoGen.vue'

export default {
  name: 'NewTemplateTest',
  components: {
    FormAutoGen,
  },
  data(){
    return {
      form_data: [
        {type: "text", label: "Field 1 label"},
        {type: "checkbox", label: "a checkbox"},
        {type: "checkbox", label: "another checkbox"},
        {type: "text", label: "another text field"},
        {type: "file", label: "File test"},
        {type: "file", label: "File test 2"},
      ]
    }
  },
}
</script>
