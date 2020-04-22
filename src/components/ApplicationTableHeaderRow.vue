<template>

  <tr class="headers_row">
    <th class="date_header">
      <calendar-icon/>
    </th>
    <th class="type_header">
      Type
    </th>
    <th class="title_header">
      Title
    </th>
    <th class="applicant_header" v-if="!hideApplicant">
      <account-icon />
    </th>
    <th class="progress_header">
      <percent-icon />
    </th>
    <th class="recipient_header" v-if="!hideRecipient">
      <account-check-icon/>
    </th>
  </tr>

</template>

<script>
import CalendarIcon from 'vue-material-design-icons/Calendar.vue';
import AccountIcon from 'vue-material-design-icons/Account.vue';
import AccountCheckIcon from 'vue-material-design-icons/AccountCheck.vue';
import PercentIcon from 'vue-material-design-icons/Percent.vue';

export default {
  name: 'ApplicationTableHeaderRow',
  props: {
    hideApplicant: {
      type: Boolean,
      default(){return false}
    },
    hideRecipient: {
      type: Boolean,
      default(){return false}
    },
  },
  components: {
    CalendarIcon,
    PercentIcon,
    AccountIcon,
    AccountCheckIcon,

  }
}
</script>

<style scoped>



</style>
