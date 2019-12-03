<template>
  <table>
    <tr v-for="(field, index) in fields">
      <td>{{field.label}}</td>

      <td>
        <input
          v-if="field.type === 'file'"
          v-bind:type="field.type"
          v-on:change="file_upload($event, field)">

        <input
          v-else
          v-bind:type="field.type"
          v-model="field.value">
      </td>

    </tr>
  </table>
</template>

<script>
export default {
  name: 'FormAutoGen',
  props: {
    fields: Array
  },
  methods: {
    file_upload(event, field){

      let formData = new FormData();
      formData.append('file_to_upload', event.target.files[0]);
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/file_upload', formData, {
        headers: {'Content-Type': 'multipart/form-data' }
      })
      .then(response => {
        field.value = response.data
      })
      .catch(error => console.log(error));
    },
  }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

table th {
  text-align: left;
  padding: 10px;
}
table td {
  padding: 5px;
}

td input[type="text"]{
  width: 100%;
}
</style>
