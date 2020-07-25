<template>

  <tr
    @click="$router.push({name: 'show_application', query: {id: application.identity.low}})">
    <td>
      {{application.properties.creation_date.year.low}}/{{application.properties.creation_date.month.low}}/{{application.properties.creation_date.day.low}}
    </td>

    <td v-if="forbidden">
      秘密 / Hidden
    </td>
    <td v-else>
      {{application.properties.type}}
    </td>
    <td v-if="forbidden">
      秘密 / Hidden
    </td>
    <td v-else>
      {{application.properties.title}}
    </td>
    <td>
      <template v-if="application.properties.private">
        機密 / Confidential
      </template>
    </td>
    <td>
      {{applicant.properties.display_name}}
    </td>

    <td
      v-for="(field_label, i) in fields"
      :key="`${application.identity.low}_field_${i}`">
      <template v-if="!forbidden">
        {{field_value(field_label, application.identity.low)}}
      </template>
      <span v-else>
        秘密 / Hidden
      </span>

    </td>


  </tr>

</template>

<script>


export default {
  name: 'RefusalReason',
  props: {
    record: Object,
    fields: Array,
  },
  methods: {
    field_value(field_label, application_id){

      if(!Array.isArray(this.form_data)) return null
      let found_field = this.form_data.find(field => {
        return field.label === field_label
      })

      if(found_field) return found_field.value
      else return null


    }
  },
  computed: {
    application(){
      return this.record._fields[this.record._fieldLookup.application]
    },
    applicant(){
      return this.record._fields[this.record._fieldLookup.applicant]
    },
    forbidden(){
      return this.record._fields[this.record._fieldLookup.forbidden]
    },
    form_data(){
      return JSON.parse(this.application.properties.form_data)
    },
  }

}
</script>

<style scoped>



td {
  padding: 0.25em 0.5em;
  max-width: 20em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
