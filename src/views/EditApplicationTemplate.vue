<template>
  <form v-on:submit.prevent="submit()">
    <button type="button" v-on:click="add_field()">add field</button>

    <div class="field" v-for="(entry, index) in application_template">

      <div class="">
        <label for="">ラベル / Label</label>
        <input type="text" name="" value="">
      </div>

      <div class="">
        <label for="">タイプ / Type</label>
        <select class="">
          <option
            v-for="field_type in field_types"
            v-bind:value="field_type.type">{{field_type.label}}</option>
        </select>
      </div>

      <button type="button" v-on:click="delete_field(index)">delete</button>




    </div>

  </form>
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
      application_template : [],

    }
  },
  mounted(){

  },
  methods: {
    add_field(){
      this.application_template.push({type: "text", label: "label"})
    },
    delete_field(index){
      this.application_template.splice(index,1)
    },
    submit(){
      console.log("submit")
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
