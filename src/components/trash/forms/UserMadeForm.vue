<template>
  <div>
    <FormAutoGen v-bind:fields.sync="form_data"/>


    <div class="author">
      Form created by {{creator.name_kanji}} ({{creator.email_address}})
    </div>
  </div>
</template>

<script>
import FormAutoGen from '@/components/FormAutoGen.vue'

export default {
  name: 'UserMadeForm',
  components: {
    FormAutoGen,
  },
  props: {
    fields: Array,
    creator: Object,
  },
  mounted(){
    this.fields.forEach(field => {
      this.form_data.push(field)
    })
  },
  data(){
    return {
      form_data: []
    }
  },
}
</script>

<style>
.author {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dddddd;
}
</style>
