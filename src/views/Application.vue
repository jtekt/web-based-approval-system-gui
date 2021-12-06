<template>
  <v-card>

    <template v-if="application && !loading && !error">

      <v-toolbar
        flat>

        <v-toolbar-title>
          {{application.properties.title}}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- Help dialog -->
        <HelpDialog />


        <v-btn
          text
          @click="$router.push({ name: 'new_application', query: { copy_of: application.identity } })">
          <v-icon>mdi-restore</v-icon>
          <span>再申請 / Re-submit</span>
        </v-btn>


        <v-btn
          text
          :disabled="application_is_fully_approved"
          color="#c00000"
          @click="delete_application()">
          <v-icon>mdi-delete</v-icon>
          <span>申請削除 / Delete</span>
        </v-btn>




      </v-toolbar>
      <v-divider></v-divider>

      <!-- Application info -->
      <v-card-text>
        <v-row>

          <v-col>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>ID</v-list-item-subtitle>
                <v-list-item-title>{{application.identity}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>日付 / Date</v-list-item-subtitle>
                <v-list-item-title>{{format_date_neo4j(application.properties.creation_date)}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>申請者 / Applicant</v-list-item-subtitle>
                <v-list-item-title>
                  <span>{{application.applicant.properties.display_name}}</span>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>申請者のコメント / Applicant comment</v-list-item-subtitle>
                <v-list-item-title>{{application.properties.form_data[1].value || "-"}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>


          </v-col>

          <!-- Approval flow -->
          <v-col>

            <div class="email_warning">
              回覧はメールマークをクリックして作成されたメールを送信してください
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
          :application="application"
          @pdf_stamped="get_application()"
          @reject="reject_application()"/>
      </v-card-text>


    </template>

    <v-card-text
      v-if="loading"
      class='text-center'>
      <v-progress-circular
        size="50"
        indeterminate/>
    </v-card-text>

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

  import WebHankoContainer from '@/components/web_hanko/WebHankoContainer.vue'
  import EmailButton from '@/components/EmailButton.vue'
  import PdfViewer from '@/components/PdfViewer.vue'
  import RecipientComments from '@/components/RecipientComments.vue'

  export default {
    name: 'Application',

    components: {
      WebHankoContainer,
      PdfViewer,
      RecipientComments,
      EmailButton,
      HelpDialog,
    },
    data(){
      return {
        help_dialog: false,
        application: null,
        loading: false,
        error: null,
      }
    },
    mounted(){
      this.get_application()
    },
    methods: {
      get_application(){
        this.loading = true
        this.application = null
        this.error = null
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/v2/applications/${this.application_id}`
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
      reject_application(){
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application.identity}/reject`

        this.axios.post(url)
        .then(() => {
          this.get_application()
        })
        .catch((error) => {
          console.error(error)
          alert(`Error approving application`)
        })
      },
      delete_application(){
        if(!confirm("本申請を削除致しますか？")) return
        const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/${this.application_id}`
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
        // Weird formatting because preserves indentation

        const email_body = `${recipient.properties.display_name} 様

申請マネージャーの通知メールです。

申請を提出しました。

申請者: ${this.application.applicant.properties.display_name}
タイプ: ${this.application.properties.type}
タイトル: ${this.application.properties.title}
提出先URL: ${window.location.origin}/applications/${this.application.identity}

※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。　
※詳しくは ${window.location.origin}/info

確認お願いします。`

      const email_string = `mailto:${recipient.properties.email_address}
?subject=[申請マネージャ] ${this.application.properties.type}
&body=${encodeURIComponent(email_body)}`

        window.location.href = email_string

      },
      send_email_to_applicant () {
        // Weird formatting because preserves indentation

        const email_body = `${this.application.applicant.properties.display_name} 様

申請マネージャーの通知メールです。

申請の承認が${this.application_is_rejected ? '却下' : '完了'}されました。

申請者: ${this.application.applicant.properties.display_name}
タイプ: ${this.application.properties.type}
タイトル: ${this.application.properties.title}
提出先URL: ${window.location.origin}/applications/${this.application.identity}

※IEでは動作しません。Edge (Chromium)/Firefox/GoogleChromeをご使用ください。
※詳しくは ${window.location.origin}/info

確認お願いします。`

        const email_string = `mailto:${this.application.applicant.properties.email_address}
  ?subject=[申請マネージャ] ${this.application.properties.type}
  &body=${encodeURIComponent(email_body)}`

        window.location.href = email_string
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
        const user =  this.$store.state.current_user
        return this.application.recipients.find(recipient => recipient.identity === user.identity)
      },
      application_is_rejected(){
        return !!this.application.recipients.find(recipient => recipient.refusal)
      },
      application_is_fully_approved(){
        const recipient_count = this.application.recipients.length
        const approval_count = this.application.recipients.reduce((acc, recipient) => acc + (recipient.approval ? 1 : 0), 0)
        return approval_count === recipient_count
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

.email_warning {
  color: #c00000;
}



</style>
