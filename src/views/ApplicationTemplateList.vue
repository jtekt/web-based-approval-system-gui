<template>
  <div class="">
    <h1>フォームテンプレート / Form templates</h1>

    <!-- add button -->
    <div class="new_template_button_wrapper">

      <button
        type="button"
        class="bordered"
        @click="new_template()">
        <plus-icon />
        <span>新しい申請フォーム / New application form</span>
       </button>
    </div>

    <div
      class="loader_container"
      v-if="loading">
      <Loader>Loading form templates</Loader>
    </div>

    <div class="error_message" v-if="error">
      Error loading forms
    </div>

    <template v-if="!loading && !error">
      <h2>自分のフォーム / My forms</h2>
      <table class="templates_table">
        <tr
          v-for="(template, index) in templates_of_user"
          :key="`template_${index}`"
          v-on:click="view_template(template.identity)"
          class="clickable_row">
          <td>{{template.properties.label}}</td>
          <td></td>
        </tr>
      </table>

      <h2>共有されているフォーム / Shared with me</h2>
      <table class="templates_table" >

        <tr>
          <th>タイトル / Title</th>
          <th>著者 / Author</th>
        </tr>

        <tr
          v-for="(template, index) in shared_templates"
          :key="`template_${index}`"
          v-on:click="view_template(template.identity)"
          class="clickable_row">
          <td>{{template.properties.label}}</td>
          <td>{{template.author.properties.display_name}}</td>
        </tr>

      </table>
    </template>




  </div>
</template>

<script>

export default {
  name: 'ApplicationTemplateList',
  data () {
    return {
      application_templates: [],
      //shared_templates: [],
      loading: false,
      error: null,
    }
  },
  mounted () {
    //this.get_my_templates()
    //this.get_shared_templates()
    this.get_templates()
  },
  methods: {
    get_templates(){
      this.loading = true
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates`
      this.axios.get(url)
      .then( ({data}) => { this.application_templates = data })
      .catch( (error) => {
        console.error(error)
        this.error = 'Error loading templates'
      })
      .finally(() => {this.loading = false})
    },
    view_template (id) {
      this.$router.push({ name: 'application_template', params: { template_id: id } })
    },
    new_template () {
      this.$router.push({ name: 'application_template', params: { template_id: 'new' } })
    }

  },
  computed: {
    current_user_id(){
      return this.$store.state.current_user.identity.low || this.$store.state.current_user.identity
    },
    templates_of_user(){
      return this.application_templates.filter(template => {
        return template.author.identity === this.current_user_id
      })
    },
    shared_templates(){
      return this.application_templates.filter(template => {
        return template.author.identity !== this.current_user_id
      })
    }

  }
}
</script>

<style scoped>
.new_template_button_wrapper{
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
