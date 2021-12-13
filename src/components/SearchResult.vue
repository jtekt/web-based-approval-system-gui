<template>

  <tr
    @click="result_clicked()">
    <td>{{get_id_of_item(application)}}</td>
    <td>
      {{format_date(application.properties.creation_date)}}
    </td>

    <td>
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
      :key="`${get_id_of_item(application)}_field_${i}`">

      <!-- Hiding confidential fields -->
      <span v-if="forbidden">
        秘密 / Hidden
      </span>

      <!-- Nprmal fields -->
      <template v-if="!forbidden">
        {{field_value(field_label, get_id_of_item(application))}}
      </template>

    </td>

  </tr>

</template>

<script>

import DateFormatting from '@/mixins/DateFormatting.js'
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'SearchResult',
  mixins: [
    DateFormatting,
    IdUtils
  ],
  props: {
    application: Object,
    fields: Array
  },
  methods: {
    field_value (field_label, application_id) {
      if (!Array.isArray(this.form_data)) return null
      let found_field = this.form_data.find(field => {
        return field.label === field_label
      })

      // Do not return anything if the field is not found
      if (!found_field) return null
      if (this.isValidDate(new Date(found_field.value))) {
        let options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
        return new Date(found_field.value).toLocaleString('ja-JP', options)
      } else return found_field.value
    },
    isValidDate (date) {
      return date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date)
    },
    result_clicked(){
      const application_id = this.get_id_of_item(this.application)
      $router.push({ name: 'application', params: {application_id } })
    }
  },
  computed: {

    applicant () {
      return this.application.applicant
    },
    forbidden () {
      return this.application.forbidden
    },
    form_data () {
      return JSON.parse(this.application.properties.form_data)
    }
  }

}
</script>

<style scoped>

td:not(:last-child) {
  padding-right: 1em;
}

td {
  padding-top: 0.125em;
  padding-bottom: 0.125em;
  max-width: 20em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
