<template>
  <tr class="headers_row">
    <!--<th>ID</th>-->
    <th>日付 / Date</th>
    <th>種類 / Type</th>
    <th v-if="!hideApplicant">申請者 / Applicant</th>
    <th>タイトル / Title</th>
  </tr>


</template>

<script>

export default {
  name: 'ApplicationTableHeaderRow',
  props: {
    hideApplicant: {
      type: Boolean,
      default(){return false}
    },
  },
}
</script>

<style scoped>
.headers_row{
  text-align: left;
}


</style>
