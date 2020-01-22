<template>
  <div>

    <label>Test field</label>
    <input type="text" v-model="form_data.test_field">

  </div>


</template>

<script>
export default {
  name: 'TestForm',
  data(){
    return {
      form_data: {
        test_field: "",

      }
    }
  },
}
</script>
