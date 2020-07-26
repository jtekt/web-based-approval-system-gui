<template>
  <div class="refusal_reasons">
    <table>
      <tr
        v-for="(recipient_record, index) in recipient_records"
        v-if="recipient_record._fields[recipient_record._fieldLookup['rejection']]">
        <td class="refuser_name">
          {{recipient(recipient_record).properties.name_kanji
            || recipient(recipient_record).properties.display_name
            || recipient(recipient_record).properties.name}}
        </td>
        <td>
          {{recipient_record._fields[recipient_record._fieldLookup['rejection']].properties.reason}}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>


export default {
  name: 'RefusalReason',
  props: {
    recipient_records: Array
  },
  methods: {
    recipient(record){
      return record._fields[record._fieldLookup['recipient']]
    }
  }

}
</script>

<style scoped>
.refusal_reasons{
  margin: 15px;
}

.refusal_reasons table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
.refusal_reasons table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.refusal_reasons table td {
  padding: 5px;
}

.refusal_reasons table .refuser_name {
  width: 25%;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

</style>
