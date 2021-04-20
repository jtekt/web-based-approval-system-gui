<template>
  <div class="rejection_reasons">
    <template v-if="submissions_with_comment.length > 0">
      <div class="comments_header">コメント / Comments</div>
      <table>

        <tr
          v-for="(submission) in submissions_with_comment.reverse()">
          <td class="refuser_name">

            {{recipient_of_submission(submission).properties.name_kanji
              || recipient_of_submission(submission).properties.display_name
              || recipient_of_submission(submission).properties.name}} :

          </td>
          <td @click="update_comment(submission)">
            <template v-if="approval_or_rejection_of_recipient(recipient_of_submission(submission))">
              {{approval_or_rejection_of_recipient(recipient_of_submission(submission)).properties.comment}}
            </template>

          </td>
        </tr>

      </table>
    </template>
  </div>
</template>

<script>

export default {
  name: 'rejectionReason',
  props: {
    submissions: Array,
    recipients: Array,
    approvals: Array,
    rejections: Array
  },
  methods: {
    recipient_of_approval (approval) {
      return this.recipients.find(recipient => {
        return approval.start === recipient.identity
      })
    },
    update_comment(submission){
      const recipient = this.recipient_of_submission(submission)

      const decision_id = this.approval_or_rejection_of_recipient(recipient).identity

      if(!this.recipient_is_user(recipient)) return
      const comment = prompt('コメント / Comment')
      if (comment === null) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/applications/irrelevant/decisions/${decision_id}/comment`
      this.axios.put(url, {comment})
      .then(() => {
        this.$emit('comment_updated')
      })
      .catch(error => {
        alert('Edit failed')
        console.error(error)
      })
    },
    recipient_of_submission (submission) {
      if (!submission) return null
      return this.recipients.find(recipient => recipient.identity === submission.end )
    },
    approval_of_recipient (recipient) {
      return this.approvals.find(approval => approval.start === recipient.identity)
    },
    rejection_of_recipient (recipient) {
      return this.rejections.find(rejection => rejection.start === recipient.identity )
    },
    approval_or_rejection_of_recipient (recipient) {
      return this.approval_of_recipient(recipient) || this.rejection_of_recipient(recipient)
    },
    recipient_is_user(recipient) {
      const current_user = this.$store.state.current_user
      return recipient.identity === (current_user.identity.low || current_user.identity)
    }

  },
  computed: {
    submissions_with_comment () {
      return this.submissions.filter(submission => {
        const recipient = this.recipient_of_submission(submission)
        const approval_or_rejection = this.approval_or_rejection_of_recipient(recipient)
        if (!approval_or_rejection) return false
        return approval_or_rejection.properties.comment
      })
    },


  }

}
</script>

<style scoped>

.comments_header {
  font-weight: bold;
}
.rejection_reasons{
  margin: 15px;
}

.rejection_reasons table {
  margin-top: 0.5em;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
.rejection_reasons table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.rejection_reasons table td {
  padding: 0.25em 0;
}

.rejection_reasons table .refuser_name {
  width: 25%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

}

</style>
