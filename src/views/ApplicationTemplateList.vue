<template>
  <div class="">
    <!-- add button -->
    <div class="add_button_wrapper">
      <button type="button" v-on:click="new_template()">New form</button>
    </div>

    <table class="templates_table">
      <tr class="header_row">
        <th colspan="1000" >My forms</th>
      </tr>
      <tr>
        <th>Form name</th>
        <th>Shared with</th>
        <th></th>
      </tr>
      <tr
        v-for="template in application_templates"
        v-on:click="view_template(template._fields[0].identity.low)"
        class="clickable_row">
        <td>{{template._fields[0].properties.label}}</td>
        <td>{{template._fields[template._fieldLookup['g']].properties.original_name}}</td>
        <td></td>
      </tr>
      <tr class="header_row">
        <th colspan="1000" >Shared with me</th>
      </tr>
      <tr>
        <th>Form name</th>
        <th>Shared with</th>
        <th>Author</th>
      </tr>
      <tr
        v-for="template in shared_templates"
        v-on:click="view_template(template._fields[0].identity.low)"
        class="clickable_row">
        <td>{{template._fields[0].properties.label}}</td>
        <td>{{template._fields[template._fieldLookup['g']].properties.original_name}}</td>
        <td>
          {{template._fields[template._fieldLookup['creator']].properties.name_kanji}}
        </td>
        <td></td>
      </tr>
    </table>




  </div>
</template>

<script>



export default {
  name: 'EditApplicationTemplate',
  data(){
    return {
      application_templates : [],
      shared_templates: [],
    }
  },
  mounted(){
    this.get_my_templates();
    this.get_shared_templates();
  },
  methods: {
    get_my_templates(){
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_application_form_templates_from_user')
      .then( (response) => {
        this.application_templates.splice(0,this.application_templates.length)
        response.data.forEach(template => {
          this.application_templates.push(template)
        })
      })
      .catch(error => console.log(error));
    },
    get_shared_templates(){
      this.axios.post(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/get_all_application_form_templates')
      .then( (response) => {
        this.shared_templates.splice(0,this.shared_templates.length)
        response.data.forEach(template => {
          this.shared_templates.push(template)
        })
      })
      .catch(error => console.log(error));
    },
    view_template(id){
      this.$router.push({ name: 'edit_application_template', query: { id: id } })
    },

    new_template(){
      this.$router.push({ name: 'edit_application_template' })
    },

  },
  computed: {

  }
}
</script>

<style scoped>
.add_button_wrapper{
  text-align: center;
  padding: 10px;

}

.header_row {
  font-size: 150%;

}

.header_row:not(:first-child) > th {
  padding-top: 15px;
}

.templates_table{
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}


.templates_table tr:not(:last-child):not(.header_row){
  border-bottom: 1px solid #dddddd;

}

.templates_table button {
  margin-left: 10px;
}

.clickable_row {
  cursor: pointer;
  transition: background-color 0.25s;
}

.clickable_row:hover {
  background-color: #eeeeee;
}

</style>
