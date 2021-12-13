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
        style="white-space: pre-line;" v-text="recipient_comment || 'No comment'" />

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
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'ApprovalComment',
  props: {
    recipient: Object,
  },
  mixins: [
    IdUtils
  ],
  data(){
    return {
      editing: false,
      new_comment: '',
    }
  },
  methods: {
    enable_editing(){
      if (!this.recipient_is_user) return
      this.new_comment = this.recipient_comment || ''
      this.editing = true
    },
    disble_editing(){
      this.editing = false
    },
    update_comment () {

      if (!this.recipient_is_user) return
      const decision_id = this.get_id_of_item(this.decision)
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/decisions/${decision_id}/comment`
      const body = { comment: this.new_comment || "No comment" }
      this.axios.put(url, body)
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
      return this.get_id_of_item(this.recipient) === this.current_user_id
    },
    decision(){
      return this.recipient.approval || this.recipient.refusal
    },
    recipient_comment(){
      if(!this.decision) return null
      return this.decision.properties.comment

    },
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
