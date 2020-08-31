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

    <h2>自分のフォーム / My forms</h2>
    <table
      class="templates_table"
      v-if="!application_templates.loading && !application_templates.error">
      <tr
        v-for="template in application_templates"
        v-on:click="view_template(template._fields[template._fieldLookup['aft']].identity.low)"
        class="clickable_row">
        <td>{{template._fields[template._fieldLookup['aft']].properties.label}}</td>
        <td></td>
      </tr>
    </table>

    <div
      class="loader_container"
      v-if="application_templates.loading">
      <Loader>Loading forms</Loader>
    </div>

    <div class="error_message" v-if="application_templates.error">
      Error loading forms
    </div>

    <h2>共有されているフォーム / Shared with me</h2>
    <table
      class="templates_table"
      v-if="!shared_templates.loading && !shared_templates.error">
      <tr>
        <th>タイトル / Title</th>
        <th>著者 / Author</th>
      </tr>
      <tr
        v-for="template in shared_templates"
        v-on:click="view_template(template._fields[template._fieldLookup['aft']].identity.low)"
        class="clickable_row">
        <td>{{template._fields[template._fieldLookup['aft']].properties.label}}</td>
        <td>{{template._fields[template._fieldLookup['creator']].properties.name_kanji}}</td>
      </tr>
    </table>

    <div
      class="loader_container"
      v-if="shared_templates.loading">
      <Loader>Loading forms</Loader>
    </div>

    <div
      class="error_message"
      v-if="shared_templates.error">
      Error loading forms
    </div>

  </div>
</template>

<script>


export default {
  name: 'ApplicationTemplateList',
  data () {
    return {
      application_templates: [],
      shared_templates: []
    }
  },
  mounted () {
    this.get_my_templates()
    this.get_shared_templates()
  },
  methods: {
    get_my_templates () {
      this.$set(this.application_templates, 'loading', true)
      this.application_templates.splice(0, this.application_templates.length)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/made_by_user`)
        .then((response) => {
          this.application_templates.splice(0, this.application_templates.length)
          response.data.forEach(record => {
          // Dealing with records here because involves creator and group
            this.application_templates.push(record)
          })
        })
        .catch(() => { this.$set(this.application_templates, 'error', true) })
        .finally(() => { this.$set(this.application_templates, 'loading', false) })
    },
    get_shared_templates () {
      this.$set(this.shared_templates, 'loading', true)
      this.axios.get(`${process.env.VUE_APP_SHINSEI_MANAGER_URL}/application_form_templates/shared_with_user`)
        .then((response) => {
          this.shared_templates.splice(0, this.shared_templates.length)
          response.data.forEach(record => {
          // Dealing with records here because involves creator and group
            this.shared_templates.push(record)
          })
        })
        .catch(() => { this.$set(this.shared_templates, 'error', true) })
        .finally(() => { this.$set(this.shared_templates, 'loading', false) })
    },
    view_template (id) {
      this.$router.push({ name: 'application_template', params: { template_id: id } })
    },

    new_template () {
      this.$router.push({ name: 'application_template' })
    }

  },
  computed: {

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
