<template>

  <!-- Wrapping everything in a form might not be a good idea... -->
  <form v-on:submit.prevent="create_application()">


    <!-- type selector -->
    <div class="section_wrapper">
      <label>Application type: </label>
      <select v-model="type">
        <option value="undefined">Please select</option>
        <option
          v-for="type in types"
          v-bind:value="type">{{type}}</option>
      </select>
    </div>


    <EmployeePicker v-on:employeeSelected="add_to_recipients($event)" />

    <ApprovalFlow
      v-on:deleteEmployee="delete_recipient($event)"
      v-bind:employees="recipients"/>


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
// Applications come here

import EmployeePicker from '@/components/jtekt_vue_employee_picker/EmployeePicker.vue'

import ApprovalFlow from '@/components/ApprovalFlow.vue'


import PcTakeOut from '@/components/forms/PcTakeOut.vue'
import PcBringBack from '@/components/forms/PcBringBack.vue'
import TestForm from '@/components/forms/TestForm.vue'
import Report from '@/components/forms/Report.vue'


export default {
  name: 'EditApplication',
  components: {
    EmployeePicker,
    ApprovalFlow,
    PcTakeOut,
    TestForm,
    Report,
    PcBringBack,
  },
  data(){
    return {
      // TURN THIS INTO AN ARRAY OF OBJECTS
      types: ['PcTakeOut', 'PcBringBack', 'TestForm', 'Report'],
      type: "PcTakeOut",
      recipients: [],

      company_structure : [],
      employees: [],
      selected_employee: null,

    }
  },
  mounted(){


  },
  methods: {

    create_application(){
      var form_data = this.$refs.form._data.form_data
      
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/create_application', {
        type: this.type,
        recipients_employee_number: this.recipients.map(a => a._fields[0].properties.employee_number),
        session_id: this.$store.state.session_id,
        form_data: form_data,
      })
      .then(response => this.$router.push({ name: 'submitted_applications' }) )
      .catch(error => console.log(error));


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
        // Add flow index
        recipient_to_add.flow_index = this.recipients.length-1;
      }
      else {
        alert("Duplicats not allowed")
      }


    },
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





</style>
