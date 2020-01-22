<template>
  <div>

    <table>
      <tr>
        <td>目的・理由 / Reason for purchase</td>
        <td><input type="text" v-model="form_data.reason"></td>
      </tr>
      <tr>
        <td>購入先 / Vendor</td>
        <td><input type="text" v-model="form_data.vendor"></td>
      </tr>
      <tr>
        <td>金額 / Amount</td>
        <td><input type="text" v-model="form_data.amount"></td>
      </tr>
      <tr>
        <td>税込 / Taxe include</td>
        <td><input type="checkbox" id="checkbox" v-model="form_data.tax_included"></td>
      </tr>
    </table>

  </div>


</template>

<script>
export default {
  name: 'PcTakeOut',
  data(){
    return {
      form_data: {
        reason: "",
        vendor: "",
        amount: 0,
        tax_included: false,
      },
    }
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

table td {
  padding: 5px;
}

</style>
