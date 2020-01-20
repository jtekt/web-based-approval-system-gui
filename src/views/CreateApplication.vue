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
    <!-- MAKE THIS A TABLE -->
    <div class="type_and_title_input_wrapper section_wrapper">
      <div class="">
        <label>申請種類 / Application type: </label>
        <select v-model="type">
          <option value="undefined">Please select</option>
          <option
            v-for="application_type in application_types"
            v-bind:value="application_type">{{application_type.label}}</option>
        </select>
      </div>
      <div class="title_wrapper">
        <label>申請タイトル / Title of the application: </label>
        <input type="text" class="title_input" v-model="title">
      </div>
    </div>


    <div class="section_wrapper" >

      <component
        v-if="type !=='undefined'"
        v-bind:is="type.component"
        ref="form"/>

      <div v-else>申請種類が選ばれていません / Application type not selected</div>

    </div>


    <!-- submit application form -->
    <!-- DANGEROUS! WHAT IF PRESS ENTER? -->
    <div class="submit_button_container" >

      <span
        class="mdi mdi-send submit_button"
        v-bind:class="{disabled: !form_valid}"
        v-on:click="create_application()"> Send</span>

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
import MemoryTakeOut from '@/components/forms/MemoryTakeOut.vue'
import MemoryBringBack from '@/components/forms/MemoryBringBack.vue'

import Report from '@/components/forms/Report.vue'

import ReceiptPurchaseBefore from '@/components/forms/ReceiptPurchaseBefore.vue'
import ReceiptPurchaseAfter from '@/components/forms/ReceiptPurchaseAfter.vue'
import InvoicePurchaseBefore from '@/components/forms/InvoicePurchaseBefore.vue'
import InvoicePurchaseAfter from '@/components/forms/InvoicePurchaseAfter.vue'

import NewTemplateTest from '@/components/forms/NewTemplateTest.vue'
import TestForm from '@/components/forms/TestForm.vue'
import TestFormAlternative from '@/components/forms/TestFormAlternative.vue'

// Mixins
// Application types are gotten from this mixin
import {application_types} from '@/mixins/application_types.js'


export default {
  name: 'EditApplication',
  components: {

    EmployeePicker,
    ApprovalFlow,

    // Forms
    PcTakeOut,
    PcBringBack,
    MemoryTakeOut,
    MemoryBringBack,

    Report,

    ReceiptPurchaseBefore,
    ReceiptPurchaseAfter,

    InvoicePurchaseBefore,
    InvoicePurchaseAfter,

    NewTemplateTest,
    TestForm,
    TestFormAlternative,
  },
  mixins: [
    application_types,
  ],
  data(){
    return {

      type: "undefined",

      title: "",

      // approval Flow
      recipients: [],

    }
  },
  mounted(){

    // Attempt to copy the content of one application into a new one
    // NOT VERY CLEAN
    if(this.$route.query.copy_of){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_application', {
        application_id: this.$route.query.copy_of
      })
      .then(response => {
        var application_properties = response.data[0]._fields[0].properties

        // Set title and type
        this.type = this.application_types.find(el => el.label === application_properties.type)
        this.title = "Copy of " + response.data[0]._fields[0].properties.title

        // Need timeout to let time to populate
        setTimeout( () => this.$refs.form._data.form_data=JSON.parse(application_properties.form_data), 500)

        // recreate flow
        // DIRTY!!
        response.data.reverse().forEach(recipient => {
          this.recipients.push({
            _fields: [recipient._fields[recipient._fieldLookup['recipient']]]
          });
        })


      })
      .catch(error => console.log(error));
    }


  },
  methods: {


    create_application(){

      if(this.form_valid){
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/create_application', {
          type: this.type.label,
          title: this.title,
          recipients_employee_number: this.recipients.map(a => a._fields[0].properties.employee_number),
          session_id: this.$store.state.session_id,

          // Get form data from the ref
          // Ref is on the dynamic component
          form_data: this.$refs.form._data.form_data,

          // Referred application not implemented yet
          //referred_application_id: this.$refs.form._data.referred_application_id
        })
        .then(response => {

          console.log(response.data)


          // send notification email to recipients
          if(confirm(`Send notification email ?`)){

            /*
            let recipient_email_addresses_string = ""

            for (let email_address of this.recipients.map(a => a._fields[0].properties.email_address)) {
              recipient_email_addresses_string += (email_address + ";")
            }

            let recipient_names_string =""
            for (let name of this.recipients.map(a => a._fields[0].properties.name_kanji)) {
              recipient_names_string += (name + "様、")
            }
            */

            // Weird formatting because preserves indentation
            window.location.href = `
mailto:${this.recipients[0]._fields[0].properties.email_address}
?subject=[自動送信] ${response.data[0]._fields[0].properties.type}を提出しました
&body=${this.recipients[0]._fields[0].properties.name_kanji}%0D%0A
%0D%0A
提出先URL%0D%0A
http://shinseimanager.mike.jtekt.maximemoreillon.com/show_application?id=${response.data[0]._fields[0].identity.low}%0D%0A
%0D%0A
確認お願いします。%0D%0A
            `

          }

          // Creation successful
          if(this.$route.query.copy_of){
            if(confirm('Delete previous application?')){
              this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/delete_application', {
                application_id: this.$route.query.copy_of
              })
              .then( () => this.$router.push({ name: 'submitted_applications' }))
              .catch(error => console.log(error));
            }
            else this.$router.push({ name: 'submitted_applications' })
          }
          else this.$router.push({ name: 'submitted_applications' })

        })
        .catch(error => console.log(error));
      }
      else {
        alert("There are missing items in this application form")
      }


    },

    get_employees_belonging_to_node(node_id){
      this.axios.post('http://authentication.mike.jtekt.maximemoreillon.com/get_employees_belonging_to_node', {
        node_id: node_id,
      })
      .then(response => this.employees = response.data)
      .catch(error => console.log(error));
    },

    delete_recipient(recipient_index){
      this.recipients.splice(recipient_index,1);
    },
    add_to_recipients(recipient_to_add){

      // Prevent duplicates
      if(!this.recipients.includes(recipient_to_add)){
        this.recipients.push(recipient_to_add);
      }
      else {
        alert("Duplicates not allowed")
      }


    },
  },
  computed: {
    form_valid(){
      return this.type !=='undefined' || this.recipients.length > 0
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
  /*
  display: flex;
  flex-wrap: wrap;
  */
}
.type_and_title_input_wrapper > div {
  margin: 10px;
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

.submit_button_container {
  text-align: center;
  padding: 15px;
}

.submit_button {
  border: 1px solid #444444;
  border-radius: 5px;
  padding: 5px;
  font-size: 150%;
  transition: color 0.25s border-color 0.25s;
}

.submit_button:not(.disabled){
  cursor: pointer;
}

.submit_button:not(.disabled):hover{
  color: #c00000;
  border-color: #c00000;
}

.submit_button.disabled{
  cursor: not-allowed;
}
</style>
