<template>
  <div>
    <input type="file" ref="file_input" v-on:change="upload_file($event)">
  </div>
</template>

<script>
export default {
  name: 'Report',
  data(){
    return {
      form_data: {
        file: null,
      }
    }
  },
  methods: {
    upload_file(event){
      let formData = new FormData();
      formData.append('file_to_upload', event.target.files[0]);
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/file_upload', formData, {
          headers: {'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
          this.form_data.file = response.data;
        })
        .catch(error => console.log(error));
    },
  },
}
</script>
