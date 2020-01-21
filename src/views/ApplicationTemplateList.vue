<template>
  <div class="">
    <!-- add button -->
    <div class="add_button_wrapper">
      <button type="button" v-on:click="new_template()">New form</button>
    </div>

    <div class="templates_wrapper">
      <div class="template" v-for="application_template in application_templates">

        <div class="template_label">
          {{application_template._fields[0].properties.label}}
        </div>

        <button type="button" v-on:click="edit_template(application_template._fields[0].identity.low)">Edit</button>
        <button type="button" v-on:click="delete_template(application_template._fields[0].identity.low)">delete</button>
      </div>
    </div>



  </div>
</template>

<script>



export default {
  name: 'EditApplicationTemplate',
  components: {},
  mixins: [],
  data(){
    return {

      application_templates : [],

    }
  },
  mounted(){
    this.get_all_templates();
  },
  methods: {
    get_all_templates(){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_application_form_templates_from_user')
      .then( (response) => {
        console.log(response.data)
        this.application_templates.splice(0,this.application_templates.length)
        response.data.forEach(template => {
          this.application_templates.push(template)
        })
      })
      .catch(error => console.log(error));
    },
    edit_template(id){
      this.$router.push({ name: 'edit_application_template', query: { id: id } })
    },

    new_template(){
      this.$router.push({ name: 'edit_application_template' })
    },
    delete_template(id){
      this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/delete_application_form_template',
      {id:id})
      .then( (response) => {
        this.get_all_templates()
      })
      .catch(error => console.log(error));
    }

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
.template{
  display: flex;
  padding: 5px;
}

.template:not(:first-child){
  border-top: 1px solid #dddddd;
}

.template_label{
  flex-grow: 1;
}

.template button {
  margin-left: 10px;
}


</style>
