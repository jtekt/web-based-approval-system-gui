<template>
  <div>
    <table>

      <tr>
        <td>事前申請番号 / Application ID</td>
        <td>
          <input type="text" v-model="form_data['事前申請番号 / Application ID']">
        </td>
      </tr>

      <tr>
        <td>負担部門 / Billed department number</td>
        <td><input type="text" v-model="form_data['負担部門 / Billed department number']"></td>
      </tr>
      <tr>
        <td>費目 / Objective</td>
        <td><input type="text" v-model="form_data['費目 / Objective']"></td>
      </tr>
      <tr>
        <td>金額 / Amount</td>
        <td><input type="text" v-model="form_data['金額 / Amount']"></td>
      </tr>
      <tr>
        <td>税込 / Taxe include</td>
        <td><input type="checkbox" id="checkbox" v-model="form_data['税込 / Taxe include']"></td>
      </tr>

      <tr>
        <td>領収書アップロード</td>
        <td>
          <input type="file" ref="file_input" v-on:change="upload_file($event)">
        </td>
      </tr>

      <tr>
        <th colspan="2">チェック</th>
      </tr>

      <tr>
        <td>領収書（宛名：ジェイテクト）/ JTEKT written on receipt?</td>
        <td><input type="checkbox" id="checkbox" v-model="form_data['領収書（宛名：ジェイテクト）/ JTEKT written on receipt?']"></td>
      </tr>
      <tr>
        <td>購入または参加したことを示すもの / Proof of purchase available?</td>
        <td><input type="checkbox" id="checkbox" v-model="form_data['購入または参加したことを示すもの / Proof of purchase available?']"></td>
      </tr>




    </table>

  </div>
</template>

<script>
export default {
  name: 'ReceiptPurchaseAfter',
  data(){
    return {
      form_data: {
        '事前申請番号 / Application ID': "",

        '負担部門 / Billed department number': "",
        '費目 / Objective': "",
        '金額 / Amount': 0,
        '税込 / Taxe included': false,

        // Checks
        '領収書（宛名：ジェイテクト）/ JTEKT written on receipt?': false,
        '購入または参加したことを示すもの / Proof of purchase available?': false,

        file: "test",
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

</style>
