<template>
  <div class="">

    <button type="button" v-on:click="new_template()">New</button>

    <div class=""
      v-for="application_template in application_templates"
      v-on:click="edit_template(application_template._fields[0].identity.low)">
      {{application_template._fields[0].properties.title}}
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
    }

  },
  computed: {

  }
}
</script>

<style scoped>

.field {
  display: flex;
}

.field > * {
  margin: 0 10px;
}

label {
  margin-right: 10px;
}

</style>
