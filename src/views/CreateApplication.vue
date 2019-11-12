<template>
  <form v-on:submit.prevent="create_application()">

    <!-- Flow -->
    <div class="approval_flow_container">

      <div class="search">

        <div class="corporate_structure_container" v-if="company_structure.length > 0">

          <CorporateStructureNode
          v-on:select_node="get_employees_belonging_to_node($event)"
          v-for="division in company_structure"
          v-bind:node_data="division"/>
        </div>

        <!-- List for employees of selected node -->
        <!-- ADD WHOLE EMPLOYEE MAYBE (NOT JUST PROPERTIES) -->
        <div class="">
          <div class="employee" v-for="employee in employees" v-on:click="add_to_recipients(employee._fields[0].properties)">
            {{employee._fields[0].properties.name_kanji}}
          </div>
        </div>

      </div><!-- end of search area -->

      <!-- Showing the approval flow -->
      <div class="">

        <div class="selected_recipients_container" v-if="recipients.length > 0">

          <div class="selected_recipient_container" v-for="recipient, recipient_index in recipients">

            <div class="selected_recipient_details_container">
              <div class="employee_name">{{recipient.name_kanji}}</div>
              <div class="">{{recipient.employee_number}}</div>
              <div class="">
                <button type="button" v-on:click="delete_recipient(recipient_index)">delete</button>
              </div>
            </div>

            <!-- Arrow -->
            <div class="arrow_container" v-if="recipient_index < recipients.length -1 "> → </div>
          </div>

        </div>

        <div class="" v-else>
          No recipients yet
        </div>
      </div>

    </div>


    <!-- type selector -->
    <div class="">
      <label>Application type: </label>
      <select v-model="type">
        <option value="undefined">Please select</option>
        <option
          v-for="i, component_name in $options.components"
          v-if="component_name !== $options.name"
          v-bind:value="component_name">{{component_name}}</option>
      </select>
    </div>

    <div class="" v-if="type !=='undefined'">
      <component v-bind:is="type" ref="form"/>
    </div>

    <!-- submit application form -->
    <div v-if="type !=='undefined' && recipients.length > 0">
      <input type="submit">
    </div>



  </form>
</template>

<script>
// Applications come here

import CorporateStructureNode from '@/components/corporate_structure_selector/CorporateStructureNode.vue'


import PcTakeOut from '@/components/forms/PcTakeOut.vue'
import PcBringBack from '@/components/forms/PcBringBack.vue'

import TestForm from '@/components/forms/TestForm.vue'
import Report from '@/components/forms/Report.vue'


export default {
  name: 'EditApplication',
  components: {
    PcTakeOut,
    TestForm,
    Report,
    PcBringBack,
    CorporateStructureNode
  },
  data(){
    return {
      type: "undefined",
      recipients: [],

      company_structure : [],
      employees: [],
      selected_employee: null,

    }
  },
  mounted(){
    // Get company structure to select recipients
    this.get_company_structure();

  },
  methods: {

    create_application(){
      var form_data = this.$refs.form._data.form_data

      this.axios.post('http://webhanko.mike.jtekt.maximemoreillon.com/create_application', {
        type: this.type,
        recipients: this.recipients,
        session_id: this.$store.state.session_id,
        form_data: form_data,
      })
      .then(response => this.$router.push({ name: 'submitted_applications' }) )
      .catch(error => console.log(error));
    },

    get_company_structure(){
      // delete current structure
      this.company_structure.splice(0,this.company_structure.length)

      this.axios.post('http://authentication.mike.jtekt.maximemoreillon.com/get_company_structure', {})
      .then(response => {
        response.data.forEach(entry => {
          this.company_structure.push(entry);
        })

      })
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


    },
  }
}
</script>

<style scoped>

form > div {
  border: 1px solid black;
  padding: 5px;
  margin: 5px;
}

.approval_flow_container > * {
  margin: 5px;
  border: 1px solid black;
}

.section_tite {
  font-weight: bold;
  margin: 5px 0;
}

.search {
  display: flex;
  max-height: 40vh;
}

.search > div {
  border: 1px solid black;
  margin: 10px;
  width: 50%;
  overflow: auto;
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
