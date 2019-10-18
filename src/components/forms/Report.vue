<template>
  <div>
    <input type="file" ref="file_input" v-on:change="upload_file()">
  </div>


</template>

<script>
export default {
  name: 'Report',
  data(){
    return {
      form_data: {
        report_file: "",

      }
    }
  },
  methods: {
    upload_file(){
      let formData = new FormData();
      formData.append('file_to_upload', this.$refs.file_input.files[0]);
      this.axios.post('http://172.16.98.151:9723/file_upload', formData, {
          headers: {'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
          this.form_data.report_file = response.data;
        })
        .catch(error => console.log(error));
    },
  },
}
</script>
