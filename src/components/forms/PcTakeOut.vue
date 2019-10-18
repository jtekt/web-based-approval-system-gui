<template>
  <div>

    <table>
      <tr>
        <td>パソコン No.</td>
        <td><input type="text" v-model="form_data.computer_number"></td>
      </tr>
      <tr>
        <td>利用場所持出先</td>
        <input type="text" v-model="form_data.destination">
      </tr>
      <tr>
        <td>使用目的</td>
        <input type="text" v-model="form_data.reason">
      </tr>
      <tr>
        <td>持出定日</td>
        <input type="text" v-model="form_data.take_out_date">
      </tr>
      <tr>
        <td>返却予定日</td>
        <input type="text" v-model="form_data.intended_return_date">
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
        computer_number: "",
        destination: "",
        reason: "",
        take_out_date: "",
        intended_return_date: "",
      }
    }
  },
}
</script>
