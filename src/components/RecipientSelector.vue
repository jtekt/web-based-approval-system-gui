<template>
  <div class="recipient">

    <!-- division -->
    <div class="">
      <label>Division: </label>
      <select v-model="selection.division" v-on:change="get_departments_from_division()">
        <option
          v-for="division in divisions"
          v-bind:value="division._fields[0].identity.low">
          {{division._fields[0].properties.name}}
        </option>
      </select>
    </div>

    <!-- department -->
    <div class="" v-if="departments.length > 0">
      <label>Department: </label>
      <select
        v-model="selection.department"
        v-on:change="get_sections_from_department()">
        <option
          v-for="department in departments"
          v-bind:value="department._fields[0].identity.low">
          {{department._fields[0].properties.name}}
        </option>
      </select>
    </div>

    <!-- section -->
    <div class="" v-if="sections.length > 0">
      <label>Section: </label>
      <select
        v-model="selection.section"
        v-on:change="get_groups_from_section()">
        <option
          v-for="section in sections"
          v-bind:value="section._fields[0].identity.low">
          {{section._fields[0].properties.name}}
        </option>
      </select>
    </div>

    <!-- group -->
    <div class="" v-if="groups.length > 0">
      <label>Group: </label>
      <select
        v-model="selection.group">
        <option
          v-for="group in groups"
          v-bind:value="group._fields[0].identity.low">
          {{group._fields[0].properties.name}}
        </option>
      </select>
    </div>


    <!-- select employee -->
    <div class="" v-if="employees.length > 0">
      <label>Employee: </label>
      <select
        v-model="selection.employee">>
        <option
          v-for="employee in employees"
          v-bind:value="employee._fields[0].properties">
          {{employee._fields[0].properties.name_kanji}}
        </option>
      </select>
    </div>

    <button
      type="button"
      v-if="selection.employee!=='none'"
      v-on:click="$emit('add_to_recipients', selection.employee)">
      Add to recipients
    </button>






  </div>
</template>

<script>
export default {
  name: 'RecipientSelector',
  props: {

  },
  data(){
    return {
      potential_recipients: [],

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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
