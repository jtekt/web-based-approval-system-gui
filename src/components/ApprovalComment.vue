<template>
  <tr>
    <td class="recipient_name">

      {{recipient.properties.name_kanji
        || recipient.properties.display_name
        || recipient.properties.name}} :

    </td>

    <td>
      <textarea
        v-if="editing && decision"
        v-model="new_comment"/>
      <div
        v-else
        style="white-space: pre-line;" v-text="decision.properties.comment || 'No comment'" />

    </td>
    <td class="actions">
      <button
        type="button"
        @click="enable_editing()"
        v-if="recipient_is_user && !editing">
        <pencil-icon/>
      </button>
      <button
        type="button"
        @click="disble_editing()"
        v-if="editing">
        <close-icon/>
      </button>
      <button
        type="button"
        @click="update_comment()"
        v-if="editing">
        <content-save-icon/>
      </button>

    </td>
  </tr>
</template>

<script>

export default {
  name: 'ApprovalComment',
  props: {
    recipient: Object,
    decision: Object,
  },
  data(){
    return {
      editing: false,
      new_comment: '',
    }
  },
  methods: {
    recipient_of_approval (approval) {
      return this.recipients.find(recipient => {
        return approval.start === recipient.identity
      })
    },
    enable_editing(){
      if (!this.recipient_is_user()) return
      this.new_comment = this.decision.properties.comment || ''
      this.editing = true
    },
    disble_editing(){
      this.editing = false
    },
    update_comment () {

      if (!this.recipient_is_user()) return

      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/decisions/${this.decision.identity}/comment`
      this.axios.put(url, { comment: this.new_comment || "No comment" })
        .then(() => {
          this.disble_editing()
          this.$emit('comment_updated')
        })
        .catch(error => {
          alert('Edit failed')
          if(error.response) console.error(error.response.data)
          else console.error(error)
        })
    },



  },
  computed: {
    recipient_is_user () {
      const current_user = this.$store.state.current_user
      return this.recipient.identity === (current_user.identity.low || current_user.identity)
    }
  }

}
</script>

<style scoped>



table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

td {
  padding: 0.25em 0;
}

.recipient_name {
  width: 25%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

.actions {
  width: 70px;
}

textarea {
  width: 100%;
  resize: vertical;
}

</style>
