<template>
  <div>

    <label>バナナが　美味しい</label>
    <input type="text" v-model="form_data['バナナが　美味しい']">

  </div>


</template>

<script>
export default {
  name: 'TestFormAlternative',
  data(){
    return {
      form_data: {
        'バナナが　美味しい': "",
      }
    }
  },
}
</script>
