<template>
  <div>

    <div class="">
      <label for="">タイトル / Title</label>
      <input type="text" v-model="title">
    </div>
    <button type="button" v-on:click="add_field()">add field</button>

    <div class="field" v-for="(field, index) in fields">

      <div class="">
        <label for="">ラベル / Label</label>
        <input type="text" v-model="field.label">
      </div>

      <div class="">
        <label for="">タイプ / Type</label>
        <select class="" v-model="field.type">
          <option
            v-for="field_type in field_types"
            v-bind:value="field_type.type">{{field_type.label}}</option>
        </select>
      </div>

      <button type="button" v-on:click="delete_field(index)">delete</button>

    </div>

    <button type="button" v-on:click="submit()">submit</button>

  </div>
</template>

<script>



export default {
  name: 'EditApplicationTemplate',
  components: {},
  mixins: [],
  data(){
    return {
      field_types: [
        {type: 'text', label: 'テキスト / Text'},
        {type: 'file', label: 'ファイル / File'},
        {type: 'checkbox', label: 'チェックボックス / Checkbox'},
        {type: 'date', label: '日付 / Date'},
      ],
      title: "タイトル",
      fields : [],

    }
  },
  mounted(){
    this.get_template_if_exists();
  },
  methods: {
    get_template_if_exists(){
      if('id' in this.$route.query){
        console.log("GOGOGO")
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/get_application_form_template', {
          id: this.$route.query.id
        })
        .then( (response) => {
          let parsed_fields = JSON.parse(response.data[0]._fields[0].properties.fields)
          parsed_fields.forEach(field => this.fields.push(field))
          // set title
          this.title=response.data[0]._fields[0].properties.title

        })
        .catch(error => console.log(error));
      }
    },
    add_field(){
      this.fields.push({type: "text", label: "label"})
    },
    delete_field(index){
      this.fields.splice(index,1)
    },
    submit(){
      if('id' in this.$route.query){
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/edit_application_form_template', {
          fields: this.fields,
          title: this.title,
          id: this.$route.query.id,
        })
        .then( () => this.$router.push({ name: 'application_template_list' }))
        .catch(error => console.log(error));
      }
      else{
        this.axios.post('http://shinseimanager.mike.jtekt.maximemoreillon.com/create_application_form_template', {
          fields: this.fields,
          title: this.title,
        })
        .then( () => this.get_application())
        .catch(error => console.log(error));
      }

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
