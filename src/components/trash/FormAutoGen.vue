<template>
  <table>
    <tr v-for="(field, index) in fields">
      <td>{{field.label}}</td>

      <td>

        <!-- file input when file is not selected -->
        <input
          v-if="field.type === 'file' && !field.value"
          v-bind:type="field.type"
          v-on:change="file_upload($event, field)">

        <!-- file input when file is selected -->
        <span
          v-else-if="field.type === 'file' && field.value"
          class="mdi mdi-delete file_delete_button"
          v-on:click="delete_file(field)"/>


        <datepicker
          v-else-if="field.type === 'date'"
          v-model="field.value"/>


        <input
          v-else
          v-bind:type="field.type"
          v-model="field.value">

      </td>

    </tr>
  </table>
</template>

<script>
import datepicker from 'vue-date'

export default {
  name: 'FormAutoGen',
  props: {
    fields: Array
  },
  components: {
    datepicker
  },
  methods: {
    file_upload(event, field){

      let formData = new FormData();
      formData.append('file_to_upload', event.target.files[0]);
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/file_upload', formData, {
        headers: {'Content-Type': 'multipart/form-data' }
      })
      .then(response => {
        // Needed for responsiviity
        // Is this the right way?
        this.$set(field,'value',response.data)
      })
      .catch(error => console.log(error));
    },
    delete_file(field){
      // Is this the right way to set value?
      this.$set(field,'value','')
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

.file_delete_button {
  font-size: 150%;
  cursor: pointer;
}
</style>
