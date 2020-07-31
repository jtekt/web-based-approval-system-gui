<template>
  <div class="rejection_reasons">
    <table>
      <tr
        v-for="(rejection, index) in rejections">
        <td class="refuser_name">
          {{recipient_of_rejection(rejection).properties.name_kanji
            || recipient_of_rejection(rejection).properties.display_name
            || recipient_of_rejection(rejection).properties.name}}
        </td>
        <td>
          {{rejection.properties.reason}}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>


export default {
  name: 'rejectionReason',
  props: {
    recipients: Array,
    rejections: Array,
  },
  methods: {
    recipient_of_rejection(rejection){
      return this.recipients.find(recipient => {
        return JSON.stringify(rejection.start) === JSON.stringify(recipient.identity)
      })
    }
  }

}
</script>

<style scoped>
.rejection_reasons{
  margin: 15px;
}

.rejection_reasons table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
.rejection_reasons table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.rejection_reasons table td {
  padding: 5px;
}

.rejection_reasons table .refuser_name {
  width: 25%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

</style>
