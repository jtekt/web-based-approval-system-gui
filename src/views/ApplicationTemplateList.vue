<template>
  <div class="">
    <!-- add button -->
    <div class="add_button_wrapper">
      <IconButton
        v-on:clicked="new_template()"
        icon="mdi-plus"
        bordered >
        新しい申請テンプレート</IconButton>
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
        v-on:click="view_template(template._fields[template._fieldLookup['aft']].identity.low)"
        class="clickable_row">
        <td>{{template._fields[template._fieldLookup['aft']].properties.label}}</td>
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
        v-on:click="view_template(template._fields[template._fieldLookup['aft']].identity.low)"
        class="clickable_row">
        <td>{{template._fields[template._fieldLookup['aft']].properties.label}}</td>
        <td>{{template._fields[template._fieldLookup['g']].properties.original_name}}</td>
        <td>{{template._fields[template._fieldLookup['creator']].properties.name_kanji}}</td>
      </tr>
    </table>




  </div>
</template>

<script>
import IconButton from '@/components/IconButton.vue'



export default {
  name: 'EditApplicationTemplate',
  components: {
    IconButton,
  },
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

      this.$set(this.application_templates,'loading',true)
      this.application_templates.splice(0,this.application_templates.length)
      this.axios.get(process.env.VUE_APP_SHINSEI_MANAGER_URL + '/application_form_templates_from_user')
      .then( (response) => {
        this.application_templates = []
        response.data.forEach(record => {
          // Dealing with records here because involves creator and group
          this.application_templates.push(record)
        })
      })
      .catch(() => { this.$set(this.application_templates,'error',true)})
      .finally(() => { this.$set(this.application_templates,'loading',false)})
    },
    get_shared_templates(){
      this.$set(this.shared_templates,'loading',true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/all_application_form_templates_visible_to_user`)
      .then( (response) => {
        this.shared_templates.splice(0,this.shared_templates.length)
        response.data.forEach(record => {
          // Dealing with records here because involves creator and group
          this.shared_templates.push(record)
        })
      })
      .catch(() => { this.$set(this.shared_templates,'error',true)})
      .finally(() => { this.$set(this.shared_templates,'loading',false)})
    },
    view_template(id){
      this.$router.push({ name: 'application_template', query: { id: id } })
    },

    new_template(){
      this.$router.push({ name: 'application_template' })
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
