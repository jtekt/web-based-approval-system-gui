<template>
  <div class="web_hanko_container">

    <!-- recipient name -->
    <a target="_blank" :href="user_profile_url" class="hanko_container_header">
      {{ recipient_displayed_name }}
    </a>

    <div class="hanko_area">

      <!-- TODO: provide alternatives for the name! -->
      <WebHanko v-if="recipient.approval" :name="recipient_displayed_name"
        :approvalId="get_id_of_item(recipient.approval)" :date="recipient.approval.date" />



      <v-icon color="#c00000" x-large v-else-if="recipient.refusal">mdi-close-circle</v-icon>

      <EmailButton v-else-if="recipient_is_current_recipient && (user_is_applicant || user_as_recipient)"
        :user="recipient" @send_email="$emit('send_email')" />




    </div>


  </div>

</template>

<script>
import WebHanko from './WebHanko.vue'
import EmailButton from '@/components/application/EmailButton.vue'
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'WebHankoContainer',
  components: {
    WebHanko,
    EmailButton,
  },
  mixins: [
    IdUtils
  ],
  props: {
    recipient: { type: Object, required: true },
    application: Object,
  },
  data() {
    return {
      approval_status: undefined
    }
  },
  methods: {

  },
  computed: {
    current_recipient() {
      // recipients sorted by flow index apparently
      if (this.application.recipients.find(recipient => recipient.refusal)) return null
      return this.application.recipients
        .slice()
        .sort((a, b) => a.submission.flow_index - b.submission.flow_index)
        .find(recipient => !recipient.approval && !recipient.refusal)
    },
    recipient_id() {
      return this.get_id_of_item(this.recipient)
    },
    show_toolbox() {
      // If the user is a recipient that has not approved or rejected the application and also is next recipient
      return this.user_is_recipient &&
        !this.approval &&
        !this.rejection &&
        this.is_current_recipient
    },
    recipient_is_current_recipient() {
      // Is the recipient the next in the flow?
      if (!this.current_recipient) return false
      return this.recipient_id === this.get_id_of_item(this.current_recipient)
    },
    user_profile_url() {
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/users/${this.recipient_id}`
    },
    user_is_applicant() {
      return this.current_user_id === this.get_id_of_item(this.application.applicant)
    },
    user_as_recipient() {
      return this.application.recipients.find(recipient => this.get_id_of_item(recipient) === this.current_user_id)
    },
    recipient_displayed_name() {

      const {
        last_name,
        display_name
      } = this.recipient

      if (display_name && display_name.length <= 6) return display_name
      else return last_name || display_name
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.web_hanko_container {

  background-color: white;

  /* width must be set otherwise empy container shrinks */

  width: 80px;
  /* height cannot be set here */

  border: 1px solid #666666;
  border-radius: 5px;

  margin: 5px;

}

.web_hanko_container>* {
  padding: 5px;

}

.hanko_container_header {
  display: block;
  color: currentColor;
  text-decoration: none;
  text-align: center;
  font-size: 80%;

  margin: 0 5px;
  /* to prevent border from going all the way accross */
  border-bottom: 1px solid #666666;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  cursor: pointer;
  transition: color 0.25s;
}

.hanko_container_header:hover {
  color: #c00000;
}

.hanko_area {
  /* Actually used! */
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toolbox {
  margin: 0 5px;
  /* to prevent border from going all the way accross */
  border-top: 1px solid #666666;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
}


.email_button_content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
