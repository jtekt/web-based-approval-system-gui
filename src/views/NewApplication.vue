<template>
  <v-card>
    <v-card-title class="text-h4">
      {{ $t('New submission') }}
    </v-card-title>

    <!-- Application form metadata -->
    <v-card-text>
      <v-card outlined>

        <v-toolbar flat>
          <v-card-title class="mt-2 text-h6">
            {{ $t('Application info') }}
          </v-card-title>
        </v-toolbar>

        <v-card-text>

          <v-row v-if="this.$route.query.copy_of" align="center">
            <v-col cols="auto">
              {{ $t('Type') }}: {{ $t('Resubmission') }}
            </v-col>
            <v-col cols="auto">
              <v-btn outlined small exact :to="{name: 'new_application'}">
                {{ $t('Start from scratch')}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col>
              <v-select :items="application_form_templates" item-text="label" return-object v-model="selected_form"
                :label="$t('Type')" />
            </v-col>
          </v-row>


          <v-row>
            <v-col>
              <v-text-field v-model="title" :label="$t('Title')" />
            </v-col>
          </v-row>

          <v-row align="center">
            <v-col cols="auto">
              {{ $t('Confidential') }}
            </v-col>
            <v-col cols="auto">
              <v-switch v-model="confidential" />
            </v-col>
          </v-row>

          <v-row align="baseline" v-if="confidential">
            <v-col cols="auto">
              {{ $t('Visibility') }}
            </v-col>
            <v-col cols="auto">
              <v-chip>{{ $t('Approval flow')}}</v-chip>
            </v-col>
            <v-col cols="auto">
              <v-chip close v-for="(group, index) in groups" :key="`group_${index}`" @click:close="remove_group(index)">
                {{group.name}}
              </v-chip>
            </v-col>
            <v-col cols="auto">
              <AddGroupDialog @selection="add_group($event)" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>

    <!-- Application content -->
    <v-card-text>

      <v-card outlined>

        <v-toolbar flat>
          <v-card-title>
            {{ $t('Application content') }}
          </v-card-title>
        </v-toolbar>


        <v-card-text v-if="!selected_form">
          {{ $t('Please select an application type') }}
        </v-card-text>

        <template v-if="selected_form">

          <NewApplicationTemplateDetails :selected_form="selected_form"/>

          <NewApplicationFormData v-model="selected_form.fields" />
        </template>


      </v-card>
    </v-card-text>


    <v-card-text>
      <v-card outlined>
        <v-toolbar flat>
          <v-row align="center">
            <v-col cols="auto">
              <v-card-subtitle class="mt-2 text-h6">
                {{ $t('Approval flow') }}
              </v-card-subtitle>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <!-- Add recipient dialog, ideally make it a component -->
              <v-dialog v-model="add_recipient_dialog" width="900">

                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="#c00000" dark v-bind="attrs" v-on="on">
                    <v-icon>mdi-account-plus</v-icon>
                    <span>{{ $t('Add recipient') }}</span>

                  </v-btn>
                </template>


                <v-card>
                  <v-card-title class="text-h5">
                    {{ $t('Add recipient') }}
                  </v-card-title>

                  <v-card-text>
                    <UserPicker class="user_picker" v-on:selection="add_to_recipients($event)" />
                  </v-card-text>

                  <v-card-text v-if="recipients.length">
                    <NewApplicationApprovalFlow :recipients="recipients" />
                  </v-card-text>

                  <v-card-text v-else>
                    {{ $t('No recipient selected') }}
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="#c00000" text @click="add_recipient_dialog = false">
                      Close
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-toolbar>


        <v-card-text v-if="this.recipients.length > 0">
          <NewApplicationApprovalFlow :recipients="recipients" />
        </v-card-text>
        <v-card-text v-else>
          {{ $t('Please select the recipients of this application') }}
        </v-card-text>
      </v-card>
    </v-card-text>


    <v-card-text class="text-center py-10">

          <v-btn 
            x-large
            :loading="submitting" 
            color="#c00000" 
            :dark="application_valid" 
            @click="submit()"
            :disabled="!application_valid">
            <v-icon left>mdi-send</v-icon>
            <span>{{ $t('Submit application') }}</span>

          </v-btn>

    </v-card-text>

  </v-card>
</template>

<script>
import UserPicker from '@moreillon/vue_user_picker'
import NewApplicationApprovalFlow from '@/components/new_application/NewApplicationApprovalFlow.vue'
import IdUtils from '@/mixins/IdUtils.js'
import AddGroupDialog from '@/components/AddGroupDialog.vue'
import NewApplicationFormData from '../components/new_application/NewApplicationFormData.vue'
import NewApplicationTemplateDetails from '../components/new_application/NewApplicationTemplateDetails.vue'
export default {
  name: 'NewApplication',
  mixins: [
    IdUtils
  ],
  components: {
    UserPicker,
    NewApplicationApprovalFlow,
    AddGroupDialog,
    NewApplicationFormData,
    NewApplicationTemplateDetails
  },
  data(){
    return {
      application_form_templates: [],
      templates_loading: false,
      selected_form: null, // when null, recreation throws errors


      title: '',
      confidential: false,
      recipients: [],
      add_recipient_dialog: false,

      groups: [], // Groups for visibility

      submitting: false,


    }
  },

  
  watch: {
    copy_of(){
      if (!this.$route.query.copy_of) {
        // Reset form
        this.selected_form = null
        this.groups = []
        this.recipients = []
        this.title = ''
      }
    }
  },
  mounted () {
    this.get_templates()
    if (this.$route.query.copy_of) this.recreate_application_content()
  },
  methods: {
    get_templates () {
      this.templates_loading = true
      const url = `/v2/templates`
      this.axios.get(url)
      .then( ({data}) => { this.application_form_templates = data })
      .catch(error => {
        console.error(error)
      })
      .finally(() => { this.templates_loading = false})
    },
    submit(){

      this.submitting = true

      const recipients_ids = this.recipients.map( (recipient) => recipient._id || recipient.properties._id)
      const group_ids = this.groups.map( (group) => group._id || group.properties._id)


      const body = {
        title: this.title,
        type: this.selected_form.label,
        form_data: this.selected_form.fields,
        private: this.confidential,
        recipients_ids,
        group_ids,
      }


      this.axios.post(`/v2/applications`, body)
      .then(({ data }) => {
        this.$store.commit('require_email', true)
        const application_id = this.get_id_of_item(data)
        this.$router.push({ name: 'application', params: { application_id } })
      })
      .catch(error => {
        console.error(error)
        alert(error)
      })
      .finally( () => {this.submitting = false})

    },
    
    add_to_recipients(new_recipient) {
      const existing_recipient = this.recipients.find(recipient => this.get_id_of_item(recipient) === this.get_id_of_item(new_recipient))
      if (existing_recipient) return alert('Duplicates not allowed')
      this.recipients.push(new_recipient)
    },
    delete_recipient(recipient_index) {
      this.recipients.splice(recipient_index,1)
    },
    recreate_application_content () {
      // This function is called when the application is a dubplicate of an existing one

      const application_id = this.$route.query.copy_of
      const url = `/v2/applications/${application_id}`
      this.axios.get(url)
      .then(({data}) => {

        const {
          type,
          title,
          private: confidential, // renaming becuase private is reserved
          form_data,
          recipients,
          visibility,
        } = data


        // Set application details back
        this.title = title
        this.confidential = confidential

        const parsed_form_data = JSON.parse(form_data)

        this.form_data = parsed_form_data

        this.selected_form = {}

        this.$set(this.selected_form, 'label', type)
        this.$set(this.selected_form, 'fields', parsed_form_data)

        this.groups = visibility

        // Recreate flow
        this.recipients = recipients.sort((a, b) => a.submission.flow_index - b.submission.flow_index )

      })
      .catch((error) => {
        console.error(error)
      })
    },
    add_group (group_to_add) {
      const group_exists = this.groups.some(({ _id }) => _id === group_to_add._id)
      if (group_exists) return
      this.groups.push(group_to_add)
    },
    remove_group(index){
      this.groups.splice(index, 1)
    },
  },
  computed: {
    application_valid(){
      return this.title !== ''
        && this.recipients.length > 0
        && !!this.selected_form
    },
    copy_of(){
      return this.$route.query.copy_of
    }
  }
}
</script>

<style>
.user_picker {
  max-height: 300px;
}

.form_description{
  white-space: pre-line;
}
</style>
