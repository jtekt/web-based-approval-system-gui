<template>

  <!-- Wrapping everything in a form might not be a good idea... -->
  <form v-on:submit.prevent="create_application()">

    <!-- Employee picker -->
    <EmployeePicker v-on:employeeSelected="add_to_recipients($event)" />

    <!-- Approval flow -->
    <ApprovalFlow
      v-on:deleteEmployee="delete_recipient($event)"
      v-bind:employees="recipients"/>

    <!-- type selector -->
    <div class="type_and_title_input_wrapper section_wrapper">
      <div class="">
        <label>申請種類</label>
        <select v-model="type">
          <option value="undefined">Please select</option>
          <option
            v-for="application_type in application_types"
            v-bind:value="application_type.component">{{application_type.label}}</option>
        </select>
      </div>
      <div class="title_wrapper">
        <label>タイトル</label>
        <input type="text" class="title_input" v-model="title">
      </div>
    </div>

    <div class="section_wrapper" >
      <component v-if="type !=='undefined'" v-bind:is="type" ref="form"/>
      <div v-else>Type not selected</div>
    </div>

    <!-- submit application form -->
    <div class="section_wrapper" >
      <input type="submit" v-bind:disabled="type ==='undefined' || recipients.length < 1">
    </div>

  </form>
</template>

<script>
// UI elements
import EmployeePicker from '@/components/jtekt_vue_employee_picker/EmployeePicker.vue'
import ApprovalFlow from '@/components/ApprovalFlow.vue'

// Forms
import PcTakeOut from '@/components/forms/PcTakeOut.vue'
import PcBringBack from '@/components/forms/PcBringBack.vue'
import TestForm from '@/components/forms/TestForm.vue'
import Report from '@/components/forms/Report.vue'
import ReceiptPurchaseBefore from '@/components/forms/ReceiptPurchaseBefore.vue'
import ReceiptPurchaseAfter from '@/components/forms/ReceiptPurchaseAfter.vue'
import NewTemplateTest from '@/components/forms/NewTemplateTest.vue'

export default {
  name: 'EditApplication',
  components: {
    EmployeePicker,
    ApprovalFlow,

    // Forms
    PcTakeOut,
    TestForm,
    Report,
    PcBringBack,
    ReceiptPurchaseBefore,
    ReceiptPurchaseAfter,
    NewTemplateTest
  },
  data () {
    return {
      // TURN THIS INTO AN ARRAY OF OBJECTS

      application_types: [

        { label: 'パソコン持ち出し申請 / PC takeout', component: 'PcTakeOut' },

        // Purchases
        { label: '領収書事前申請 / Receipt based purchase application', component: 'ReceiptPurchaseBefore' },
        { label: '領収書精算申請 / Receipt based purchase settlement', component: 'ReceiptPurchaseAfter' },
        { label: '請求賞事前申請 / Invoice based purchase application', component: 'InvoicePurchaseBefore' },
        { label: '請求賞精算申請 / Invoice based purchase settlement', component: 'InvoicePurchaseAfter' },
        { label: 'NEW', component: 'NewTemplateTest' }

        // {label: 'メモリー持ち込み', component: 'MemoryBringIn'},
      ],

      // Default type set to PC takeout
      type: 'PcTakeOut',

      title: '',
      recipients: [],

      company_structure: [], // needed?

      employees: [],
      selected_employee: null

    }
  },
  mounted () {

  },
  methods: {

    create_application () {
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/create_application', {
        type: this.type,
        title: this.title,
        recipients_employee_number: this.recipients.map(a => a._fields[0].properties.employee_number),
        session_id: this.$store.state.session_id,

        // Get form data from the ref
        form_data: this.$refs.form._data.form_data,
        referred_application_id: this.$refs.form._data.referred_application_id
      })
        .then(response => this.$router.push({ name: 'submitted_applications' }))
        .catch(error => console.log(error))
    },

    get_employees_belonging_to_node (node_id) {
      this.axios.post('http://authentication.mike.jtekt.maximemoreillon.com/get_employees_belonging_to_node', {
        node_id: node_id
      })
        .then(response => this.employees = response.data)
        .catch(error => console.log(error))
    },

    delete_recipient (recipient_index) {
      this.recipients.splice(recipient_index, 1)
    },
    add_to_recipients (recipient_to_add) {
      // Prevent duplicates
      if (!this.recipients.includes(recipient_to_add)) {
        this.recipients.push(recipient_to_add)
        // Add flow index
        recipient_to_add.flow_index = this.recipients.length - 1
      } else {
        alert('Duplicats not allowed')
      }
    }
  }
}
</script>

<style scoped>

form > div {

}

.section_wrapper{
  border: 1px solid #dddddd;
  margin: 15px;
  padding: 10px;
}

.type_and_title_input_wrapper{
  display: flex;
  flex-wrap: wrap;
}
.type_and_title_input_wrapper > div {
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
}

.type_and_title_input_wrapper > div > label {
  margin-right: 10px;
}

.employee {
  padding: 2px 5px;
  cursor: pointer;
}
.employee:hover {
  background-color: #dddddd;
}

.selected_recipients_container {
  display: flex;
}

.selected_recipient_container {
  display: flex;
}

.selected_recipient_details_container {

  border: 1px solid black;
  border-radius: 5px;
  padding: 5px;
  margin: 5px;

  width: 12vmin;

  text-align: center;

}

.employee_name {

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow_container {
  padding: 5px;
  display: flex;
  align-items: center;
  font-size: 150%;

}

.title_wrapper {
  display: flex;
}
.title_input {
  flex-grow: 1;
}

</style>
