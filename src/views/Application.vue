<template>
  <v-card
    :loading="loading">

    <template v-if="application && !error">

      <v-toolbar flat>

        <v-row align="center">
          <v-col cols="auto">
            <v-toolbar-title>Application {{application_id}}</v-toolbar-title>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <HelpDialog />
          </v-col>
          <v-col cols="auto">
            <v-btn
              text
              @click="$router.push({ name: 'new_application', query: { copy_of: get_id_of_item(application) } })">
              <v-icon>mdi-restore</v-icon>
              <span>再申請 / Re-submit</span>
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              text
              :disabled="application_is_fully_approved"
              color="#c00000"
              @click="delete_application()">
              <v-icon>mdi-delete</v-icon>
              <span>申請削除 / Delete</span>
            </v-btn>
          </v-col>

        </v-row>

      </v-toolbar>
      <v-divider />

      <v-banner
        v-if="this.$store.state.email_required"
        single-line
        class="text-center red--text">
        回覧はメールマークをクリックして作成されたメールを送信してください
      </v-banner>

      <!-- Application info -->
      <v-card-text>
        <v-row>

          <!-- Left column: Properties -->
          <v-col cols="6">
            <v-subheader>申請について / Application Info</v-subheader>

            <v-list dense>
              <v-divider/>
              <v-list-item>
                <v-list-item-content>ID</v-list-item-content>
                <v-list-item-content class="align-end">{{get_id_of_item(application)}}</v-list-item-content>
              </v-list-item>
              <v-divider/>
              <v-list-item>
                <v-list-item-content>件名 / Title</v-list-item-content>
                <v-list-item-content class="align-end">{{application.properties.title}}</v-list-item-content>
              </v-list-item>

              <v-divider/>
              <v-list-item>
                <v-list-item-content>Type</v-list-item-content>
                <v-list-item-content class="align-end">{{application.properties.type}}</v-list-item-content>
              </v-list-item>

              <v-divider/>
              <v-list-item>
                <v-list-item-content>日付 / Date</v-list-item-content>
                <v-list-item-content class="align-end">{{format_date_neo4j(application.properties.creation_date)}}</v-list-item-content>
              </v-list-item>

              <v-divider/>
              <v-list-item>
                <v-list-item-content>申請者 / Applicant</v-list-item-content>
                <v-list-item-content class="align-end">{{application.applicant.properties.display_name}}</v-list-item-content>
              </v-list-item>

              <v-divider/>
              <v-list-item>
                <v-list-item-content>機密 / Confidential</v-list-item-content>
                <v-list-item-content class="align-end">
                  <v-switch
                    v-model="application.properties.private"
                    @change="update_privacy_of_application()"/>
                </v-list-item-content>
              </v-list-item>

              <template v-if="application.properties.private">
                <v-divider/>
                <v-list-item >
                  <v-list-item-content>Visibility</v-list-item-content>
                  <v-list-item-content class="align-end">
                    <v-row>
                      <v-col cols="auto">
                        <v-chip>Approval flow</v-chip>
                      </v-col>
                      <v-col
                        cols="auto"
                        v-for="(group, index) in application.visibility"
                        :key="`group_${index}`">
                        <v-chip>
                          <v-chip
                          :close="user_is_applicant"
                          @click:close="remove_application_visibility_to_group(group)">
                          {{group.properties.name}}
                        </v-chip>
                      </v-chip>
                      </v-col>
                      <v-col cols="auto">
                        <AddGroupDialog @selection="share_with_group($event)"/>
                      </v-col>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </template>


            </v-list>


            <!-- properties  -->
            <v-subheader>申請内容 / Application content</v-subheader>
            <v-list dense>
              <template v-for="(field, index) in application.properties.form_data" >

                <v-divider :key="`field_${index}_divider`"/>

                <v-list-item :key="`field_${index}`">

                  <v-list-item-content>{{field.label}}</v-list-item-content>

                  <v-list-item-content
                    class="align-end"
                    v-if="field.type === 'pdf'">

                    <v-btn
                      v-if="field.value"
                      @click="view_pdf(field.value)">
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </v-list-item-content>

                  <v-list-item-content
                    class="align-end"
                    v-else-if="field.type === 'file'">

                    <v-btn
                      v-if="field.value"
                      @click="download_attachment(field.value)">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </v-list-item-content>

                  <v-list-item-content
                    class="align-end"
                    v-else-if="field.type === 'checkbox'">
                    {{field.value ? '✓' : '✕'}}
                  </v-list-item-content>

                  <v-list-item-content
                    class="align-end"
                    v-else-if="field.type === 'link'">
                    <a
                      :href="field.value"
                      target="_blank">
                      {{field.value}}
                    </a>
                  </v-list-item-content>

                  <v-list-item-content
                    class="align-end"
                    v-else-if="field.type === 'application'">
                    <a
                      class="field_link"
                      :href="`/applications/${field.value}`"
                      target="_blank">
                      {{field.value}}
                    </a>
                  </v-list-item-content>

                  <v-list-item-content
                    class="align-end application_field_value"
                    v-else>
                    {{field.value || "-"}}
                  </v-list-item-content>

                </v-list-item>

              </template>
            </v-list>


          </v-col>

          <!-- Approval flow -->
          <v-col>

            <v-row
              v-if="current_recipient_is_current_user"
              class="mb-3">
              <v-spacer/>

              <v-col cols="auto">
                <v-btn
                  color="#00c000"
                  dark
                  @click="approve_application()">
                  <v-icon>mdi-check</v-icon>
                  <span>承認 / Approve</span>
                </v-btn>
              </v-col>


              <v-col cols="auto">
                <v-btn
                  color="#c00000"
                  dark
                  @click="reject_application()">
                  <v-icon>mdi-close</v-icon>
                  <span>却下 / Reject</span>
                </v-btn>
              </v-col>
            </v-row>

            <div
              v-if="current_recipient_is_current_user"
              class="approval_controls">

            </div>


            <div class="approval_flow" >

              <template
                v-if="!!user_as_recipient && !current_recipient" >

                <div class="flow_applicant">
                  <EmailButton
                    :user="application.applicant"
                    @send_email="send_email_to_applicant()" />
                </div>

                <div>
                  <v-icon class="mt-16">mdi-arrow-left</v-icon>
                </div>

              </template>

              <template
                v-for="(recipient, index) in ordered_recipients" >

                <div
                  v-if="index>0"
                  :key="`flow_arrow_${index}`">
                  <v-icon class="mt-16">mdi-arrow-left</v-icon>
                </div>

                <WebHankoContainer
                  :key="`recipient_${index}`"
                  :recipient="recipient"
                  :application="application"
                  @send_email="send_email_to_recipient(recipient)"
                  @reject="reject_application()"/>
              </template>




            </div>

            <RecipientComments
              :application="application"
              @comment_updated="get_application()"/>



          </v-col>
        </v-row>

      </v-card-text>

      <v-card-text>
        <PdfViewer
          v-if="selected_file_id"
          :selected_file_id="selected_file_id"
          :application="application"
          @pdf_stamped="get_application()"
          @reject="reject_application()"/>
      </v-card-text>


    </template>

    <v-card-text
      v-if="error"
      style="white-space: pre-line; color: #c00000;"
      class='text-center text-h6'>
      {{error}}
    </v-card-text>



  </v-card>
</template>

<script>
  import HelpDialog from '@/components/HelpDialog.vue'
  import IdUtils from '@/mixins/IdUtils.js'

  import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'
  import EmailButton from '@/components/EmailButton.vue'
  import PdfViewer from '@/components/PdfViewer.vue'
  import RecipientComments from '@/components/RecipientComments.vue'
  import AddGroupDialog from '@/components/AddGroupDialog.vue'

  export default {
    name: 'Application',

    components: {
      WebHankoContainer,
      PdfViewer,
      RecipientComments,
      EmailButton,
      HelpDialog,
      AddGroupDialog,
    },
    mixins: [
      IdUtils
    ],
    data(){
      return {
        help_dialog: false,
        application: null,
        loading: false,
        error: null,
        selected_file_id: null

      }
    },
    mounted(){
      this.get_application()
    },
    beforeRouteLeave(to, from, next) {
      const email_required = this.$store.state.email_required
      if(email_required){
        if(confirm(`メール未送信なのにページから出ますか？`)) {
          this.$store.commit('require_email', false)
          next()
        }
      }
      else next()
    },
    methods: {
      get_application(){
        this.loading = true
        this.application = null
        this.error = null
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications/${this.application_id}`
        this.axios.get(url)
        .then(({data}) => {
          this.application = data
          this.application.properties.form_data = JSON.parse(this.application.properties.form_data)
        })
        .catch((error) => {
          if(error.response) {
            console.error(error.response.data)
            if(error.response.status === 404) {
              this.error = `アイテム${this.application_id}見つけれませんでした
              Item ${this.application_id} not found`
            }
            console.log(error.response.status)
          }
          else {
            console.error(error)
          }
        })
        .finally(() => {
          this.loading = false
        })
      },
      view_pdf (file_id) {
        this.selected_file_id = file_id
      },
      approve_application(){
        const comment = prompt('コメント (任意)/ Comment (optional)')

        // if pressed cancel, return
        if (comment === null) return

        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/approve`

        this.axios.post(url, { comment })
        .then(() => { this.get_application() })
        .catch((error) => {
          console.error(error)
          alert(`Error approving application`)
        })
      },
      reject_application(){

        const comment = prompt('コメント (任意)/ Comment (optional)')

        // if pressed cancel, return
        if (comment === null) return

        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/reject`

        this.axios.post(url, { comment })
        .then(() => { this.get_application() })
        .catch((error) => {
          console.error(error)
          alert(`Error rejecting application`)
        })
      },
      delete_application(){
        if(!confirm("本申請を削除致しますか？")) return
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v1/applications/${this.application_id}`
        this.axios.delete(url)
        .then( () => {
          this.$router.push({name: 'submitted_applications'})
        })
        .catch((error) => {
          if(error.response) console.error(error.response.data)
          else console.error(error)
        })
      },
      format_date_neo4j(date){
        return `${date.year}/${date.month}/${date.day}`
      },
      email_button_clicked(){

        if(this.current_recipient) this.send_email_to_recipient(this.current_recipient)
        else this.send_email_to_applicant()
      },

      send_email_to_recipient (recipient) {

        this.$store.commit('require_email', false)

        // Weird formatting because preserves indentation

        const email_body = `${recipient.properties.display_name} 様

申請マネージャーの通知メールです。

申請を提出しました。

申請者: ${this.application.applicant.properties.display_name}
タイプ: ${this.application.properties.type}
タイトル: ${this.application.properties.title}
提出先URL: ${window.location.origin}/applications/${this.get_id_of_item(this.application)}

※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　
※詳しくは ${window.location.origin}/info

確認お願いします。`

      const email_string = `mailto:${recipient.properties.email_address}
?subject=[申請マネージャ] ${this.application.properties.type}
&body=${encodeURIComponent(email_body)}`

        window.location.href = email_string

      },
      send_email_to_applicant () {

        this.$store.commit('require_email', false)
        // Weird formatting because preserves indentation

        const email_body = `${this.application.applicant.properties.display_name} 様

申請マネージャーの通知メールです。

申請の承認が${this.application_is_rejected ? '却下' : '完了'}されました。

申請者: ${this.application.applicant.properties.display_name}
タイプ: ${this.application.properties.type}
タイトル: ${this.application.properties.title}
提出先URL: ${window.location.origin}/applications/${this.get_id_of_item(this.application)}

※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。
※詳しくは ${window.location.origin}/info

確認お願いします。`

        const email_string = `mailto:${this.application.applicant.properties.email_address}
  ?subject=[申請マネージャ] ${this.application.properties.type}
  &body=${encodeURIComponent(email_body)}`

        window.location.href = email_string
      },
      update_privacy_of_application () {
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/privacy`
        const body = { private: this.application.properties.private }
        this.axios.put(url, body)
          .then(() => {

          })
          .catch(() => alert('Error updating privacy of application'))
      },
      share_with_group (group) {
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/visibility_to_group`
        const body = { group_id: this.get_id_of_item(group) }
        this.axios.post(url, body)
          .then(() => {
            this.get_application()
          })
          .catch((error) => {
            alert('Error updating visibility of application')
            console.error(error)
          })
      },
      remove_application_visibility_to_group (group) {
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/visibility_to_group`
        const params = { group_id: this.get_id_of_item(group) }
        this.axios.delete(url, { params })
          .then(() => {
            this.get_application()
          })
          .catch((error) => {
            console.error(error)
            alert('Error updating visibility of application')
          })
      },
      download_attachment (id) {
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}/files/${id}`
        window.open(url,'_blank')
      },
    },
    computed: {
      application_id(){
        return this.$route.params.application_id
      },
      ordered_recipients(){
        return this.application.recipients
          .slice()
          .sort((a, b) => b.submission.properties.flow_index - a.submission.properties.flow_index)
      },
      current_recipient(){
        // recipients sorted by flow index apparently
        if(this.application.recipients.find(recipient => recipient.refusal)) return null

        return this.application.recipients
        .slice()
        .sort((a, b) => a.submission.properties.flow_index - b.submission.properties.flow_index)
        .find(recipient => !recipient.approval && !recipient.refusal)
      },
      user_as_recipient(){
        return this.application.recipients.find(recipient => this.get_id_of_item(recipient) === this.current_user_id)
      },
      application_is_rejected(){
        return !!this.application.recipients.find(recipient => recipient.refusal)
      },
      application_is_fully_approved(){
        const recipient_count = this.application.recipients.length
        const approval_count = this.application.recipients.reduce((acc, recipient) => acc + (recipient.approval ? 1 : 0), 0)
        return approval_count === recipient_count
      },
      user_is_applicant () {
        return this.get_id_of_item(this.application.applicant) === this.current_user_id
      },
      current_recipient_is_current_user(){
        if(!this.current_recipient) return false
        const current_recipient_id = this.get_id_of_item(this.current_recipient)
        return current_recipient_id === this.current_user_id
      },


    }
  }
</script>

<style>
.approval_flow {
  /* horizontal layout */
  display: flex;
  justify-content: flex-end;
  /* because wrap reverse */
  align-items: flex-end;
  flex-wrap: wrap-reverse;
}

.comments{
  margin-top: 3em;
}

.flow_applicant{
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

.application_field_value{
  white-space: pre-line;
}


</style>
