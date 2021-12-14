<template>
  <v-card>

    <v-toolbar flat>
      <v-toolbar-title>
        Templates
      </v-toolbar-title>
      <v-spacer/>
      <v-btn
        color="#c00000"
        dark
        :to="{name:'new_template'}">
        <v-icon>mdi-plus</v-icon>
        <span>New template</span>
      </v-btn>

      <template v-slot:extension>
        <v-tabs
          color="#444444"
          v-model="tab"
          align-with-title>

          <v-tabs-slider color="#c00000"></v-tabs-slider>

          <v-tab>
            Mine
          </v-tab>
          <v-tab>
            Shared with me
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-divider/>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card-text>
          <v-data-table
            :headers="base_headers"
            :items="templates_of_user"
            @click:row="view_template($event)"/>
        </v-card-text>
      </v-tab-item>
      <v-tab-item>
        <v-card-text>
          <v-data-table
            :headers="shared_templates_headers"
            :items="shared_templates"
            @click:row="view_template($event)"/>
        </v-card-text>
      </v-tab-item>
    </v-tabs-items>




  </v-card>
</template>

<script>
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'Templates',
  components: {

  },
  mixins: [
    IdUtils
  ],
  data(){
    return {
      tab: null,
      base_headers: [
        {text: 'Name', value: "properties.label"},
      ],

      application_templates: [],
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
    view_template (template) {
      const template_id = this.get_id_of_item(template)
      this.$router.push({ name: 'template', params: { template_id} })
    },
    new_template () {
      this.$router.push({ name: 'new_template' })
    }

  },
  computed: {
    shared_templates_headers(){
      return [
        ...this.base_headers,
        {text: 'Author', value: "author.properties.display_name"},
      ]
    },
    templates_of_user(){
      return this.application_templates.filter(template => {
        const author_id = this.get_id_of_item(template.author)
        return author_id === this.current_user_id
      })
    },
    shared_templates(){
      return this.application_templates.filter(template => {
        const author_id = this.get_id_of_item(template.author)
        return author_id !== this.current_user_id
      })
    }

  }
}
</script>
