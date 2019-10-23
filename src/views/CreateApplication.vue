<template>
  <form v-on:submit.prevent="create_application()">

    <!-- Flow -->
    <div class="approval_flow_container">
      <div class="section_tite">Approval Flow</div>

      <div class="search">

        <div class="section_tite">Search for recipient</div>

        <table>
          <!-- division -->
          <tr>
            <td>Division</td>
            <td>
              <select v-model="selection.division" v-on:change="get_departments_from_division()">
                <option
                  v-for="division in divisions"
                  v-bind:value="division._fields[0].identity.low">
                  {{division._fields[0].properties.name}}
                </option>
              </select>
            </td>
          </tr>

          <!-- department -->
          <tr class="" v-if="departments.length > 0">
            <td>Department</td>
            <td>
              <select
                v-model="selection.department"
                v-on:change="get_sections_from_department()">
                <option
                  v-for="department in departments"
                  v-bind:value="department._fields[0].identity.low">
                  {{department._fields[0].properties.name}}
                </option>
              </select>
            </td>
          </tr>

          <!-- section -->
          <tr class="" v-if="sections.length > 0">
            <td>Section</td>
            <td>
              <select
                v-model="selection.section"
                v-on:change="get_groups_from_section()">
                <option
                  v-for="section in sections"
                  v-bind:value="section._fields[0].identity.low">
                  {{section._fields[0].properties.name}}
                </option>
              </select>
            </td>
          </tr>

          <!-- group -->
          <tr class="" v-if="groups.length > 0">
            <td>Group</td>
            <td>
              <select
                v-model="selection.group">
                <option
                  v-for="group in groups"
                  v-bind:value="group._fields[0].identity.low">
                  {{group._fields[0].properties.name}}
                </option>
              </select>
            </td>
          </tr>


          <!-- select employee -->
          <tr class="" v-if="employees.length > 0">
            <td>Employee</td>
            <td>
              <select v-model="selection.employee">
                <!-- WARNING: BINDING PROPERTIES AND NOT EMPLOYEE NUMBER -->
                <option
                  v-for="employee in employees"
                  v-bind:value="employee._fields[0].properties">
                  {{employee._fields[0].properties.name_kanji}}
                </option>
              </select>
            </td>
          </tr>

          <tr>
            <td colspan="2">
              <button
                type="button"
                v-if="selection.employee!=='none'"
                v-on:click="add_to_recipients(selection.employee)">
                Add to recipients
              </button>
            </td>
          </tr>

        </table>

      </div><!-- end of search area -->



      <div>

        <div class="section_tite">Selected recipients</div>


        <table v-if="recipients.length > 0">
          <tr>
            <th>Flow index</th>
            <th>Name</th>
            <th>Empoyee number</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
          <tr v-for="recipient, recipient_index in recipients">
            <td>{{recipient_index + 1}} </td>
            <td>{{recipient.name_kanji}}</td>
            <td>{{recipient.employee_number}}</td>
            <td>{{recipient.role}}</td>
            <td>
              <button type="button" v-on:click="delete_recipient(recipient_index)" >
                delete
              </button>
            </td>
          </tr>
        </table>
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
      <component
        v-bind:is="type"
        ref="form"
      />
    </div>

    <div v-if="type !=='undefined'">
      <input type="submit">

    </div>



  </form>
</template>

<script>
// Applications come here
import PcTakeOut from '@/components/forms/PcTakeOut.vue'
import TestForm from '@/components/forms/TestForm.vue'
import Report from '@/components/forms/Report.vue'


export default {
  name: 'EditApplication',
  components: {
    PcTakeOut,
    TestForm,
    Report
  },
  data(){
    return {
      type: "undefined",
      recipients: [],

      divisions: [],
      departments: [],
      sections: [],
      groups: [],
      employees: [],

      selection: {
        division: "none",
        department: "none",
        section: "none",
        group: "none",
        employee: "none"
      }
    }
  },
  mounted(){
    this.axios.post('http://172.16.98.151:8091/get_all_divisions', {})
    .then(response => this.divisions = response.data)
    .catch(error => console.log(error));
  },
  methods: {
    create_application(){
      var form_data = this.$refs.form._data.form_data

      this.axios.post('http://172.16.98.151:9723/create_application', {
        type: this.type,
        recipients: this.recipients,
        session_id: this.$store.state.session_id,
        form_data: form_data,
      })
      .then(response => this.$router.push({ name: 'submitted_applications' }) )
      .catch(error => console.log(error));


    },
    get_departments_from_division(){
      this.axios.post('http://172.16.98.151:8091/get_departments_from_division', {
        node_id: this.selection.division,
      })
      .then(response => {
        this.departments = response.data;
        this.sections.splice(0,this.sections.length);
        this.groups.splice(0,this.groups.length);
        this.employees.splice(0,this.employees.length);

      })
      .catch(error => console.log(error));
    },
    get_sections_from_department(){
      this.axios.post('http://172.16.98.151:8091/get_sections_from_department', {
        node_id: this.selection.department,
      })
      .then(response => {
        this.get_employees_belonging_to_node(this.selection.department);
        this.sections = response.data;
        this.groups.splice(0,this.groups.length);
      })
      .catch(error => console.log(error));
    },
    get_groups_from_section(){
      this.axios.post('http://172.16.98.151:8091/get_groups_from_section', {
        node_id: this.selection.section,

      })
      .then(response => {
        this.get_employees_belonging_to_node(this.selection.section);
        this.groups = response.data;
      })
      .catch(error => console.log(error));
    },
    get_employees_belonging_to_node(node_id){
      this.axios.post('http://172.16.98.151:8091/get_employees_belonging_to_node', {
        node_id: node_id,
      })
      .then(response => this.employees = response.data)
      .catch(error => console.log(error));
    },
    delete_recipient(recipient_index){
      this.recipients.splice(recipient_index,1);
    },
    add_to_recipients(recipient_to_add){
      this.recipients.push(recipient_to_add);

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

.approval_flow_container > *:not(:first-child) {
  margin: 5px;
  border: 1px solid black;
}

.section_tite {
  font-weight: bold;
  margin: 5px 0;
}





</style>
