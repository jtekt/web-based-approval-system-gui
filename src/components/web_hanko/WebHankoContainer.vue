<template>
  <div class="web_hanko_container">

    <!-- recipient name -->
    <a
      :href="user_profile_url"
      class="hanko_container_header">
      {{recipient.properties.last_name || recipient.properties.family_name_kanji}}
    </a>

    <div class="hanko_area">

      <WebHanko
        v-if="approval"
        v-bind:name="recipient.properties.last_name"
        v-bind:approvalId="approval.identity.low"
        v-bind:date="approval.properties.date"/>

      <!-- probably need date of rejection as well as motive -->
      <Rejection
        v-else-if="rejection"/>

    </div>

    <div class="toolbox" v-if="show_toolbox">
      <check-icon class="approval_control approve_button" v-on:click="$emit('approve')"/>
      <close-icon class="approval_control disapprove_button" v-on:click="$emit('reject')"/>
    </div>
    <div class="toolbox"
      v-else-if="is_next_recipient && !this.rejection">
      
      <button
        type="button"
        @click="send_email()">
        <email-icon />
      </button>

    </div>
  </div>

</template>

<script>
import WebHanko from './WebHanko.vue'
import Rejection from './Rejection.vue'

import CheckIcon from 'vue-material-design-icons/Check.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import EmailIcon from 'vue-material-design-icons/Email.vue'


export default {
  name: 'WebHankoContainer',
  components: {
    WebHanko,
    Rejection,
    CheckIcon,
    CloseIcon,
    EmailIcon,
  },
  props: {
    applicationRecord: { type: Object, required: true },
    is_next_recipient: { type: Boolean, default () { return true } }
  },
  data () {
    return {
      approval_status: undefined,
    }
  },
  methods: {
    send_email(){
      this.$emit('send_email', this.recipient)
    }
  },
  computed: {
    recipient () {
      return this.applicationRecord._fields[this.applicationRecord._fieldLookup['recipient']]
    },
    approval () {
      return this.applicationRecord._fields[this.applicationRecord._fieldLookup['approval']]
    },
    rejection () {
      return this.applicationRecord._fields[this.applicationRecord._fieldLookup['rejection']]
    },
    submission () {
      return this.applicationRecord._fields[this.applicationRecord._fieldLookup['submitted_to']]
    },
    application () {
      return this.applicationRecord._fields[this.applicationRecord._fieldLookup['application']]
    },
    show_toolbox () {
      // If the user is a recipient that has not approved or rejected the application and also is next recipient
      return this.$store.state.current_user.identity.low === this.recipient.identity.low &&
        !this.approval &&
        !this.rejection &&
        this.is_next_recipient
    },
    user_profile_url () {
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/?id=${this.recipient.identity.low}`
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

.web_hanko_container > * {
  padding: 5px;

}

.hanko_container_header {
  display: block;
  color: currentColor;
  text-decoration: none;
  text-align: center;
  font-size: 80%;

  margin: 0 5px; /* to prevent border from going all the way accross */
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

.hanko_area{
  height: 100px;
}

.toolbox{
  margin: 0 5px; /* to prevent border from going all the way accross */
  border-top: 1px solid #666666;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
}

.toolbox .approval_control {
  flex-grow: 1;

  font-size: 120%;
  padding: 2px;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  border-radius: 5px;

  transition: color 0.25s, background-color 0.25s;
}

.approve_button{
  color: #2b8f30aa;
}

.disapprove_button, .cancel_button{
  color: #c00000;
}
.approve_button:hover{
  background-color: #2b8f30;
  color: white;
}

.disapprove_button:hover, .cancel_button:hover{
  background-color: #c00000;
  color: white;
}



</style>
