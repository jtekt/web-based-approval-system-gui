<template>
  <div class="comments_wrapper">
    <template v-if="submissions.length > 0">
      <div class="comments_header">コメント / Comments</div>
      <table>

        <template v-for="(submission, index) in submissions.reverse()">

          <ApprovalComment
            :key="`${index}`"
            v-if="approval_or_rejection_of_recipient(recipient_of_submission(submission))"
            @comment_updated="$emit('comment_updated')"
            :recipient="recipient_of_submission(submission)"
            :decision="approval_or_rejection_of_recipient(recipient_of_submission(submission))"/>

        </template>



        <!-- <tr
          v-for="(submission, index) in submissions_with_comment.reverse()"
          :key="`${index}`">
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
        </tr> -->

      </table>
    </template>
  </div>
</template>

<script>
import ApprovalComment from '@/components/ApprovalComment.vue'
export default {
  name: 'ApprovalComments',
  components: {
    ApprovalComment
  },
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
    update_comment (submission) {
      const recipient = this.recipient_of_submission(submission)

      const decision_id = this.approval_or_rejection_of_recipient(recipient).identity

      if (!this.recipient_is_user(recipient)) return
      const comment = prompt('コメント / Comment')
      if (comment === null) return
      const url = `${process.env.VUE_APP_SHINSEI_MANAGER_URL}/decisions/${decision_id}/comment`
      this.axios.put(url, { comment })
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
      return this.recipients.find(recipient => recipient.identity === submission.end)
    },
    approval_of_recipient (recipient) {
      return this.approvals.find(approval => approval.start === recipient.identity)
    },
    rejection_of_recipient (recipient) {
      return this.rejections.find(rejection => rejection.start === recipient.identity)
    },
    approval_or_rejection_of_recipient (recipient) {
      return this.approval_of_recipient(recipient) || this.rejection_of_recipient(recipient)
    },
    recipient_is_user (recipient) {
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
    }

  }

}
</script>

<style scoped>

.comments_header {
  font-weight: bold;
}
.comments_wrapper{
  margin: 15px;
}

table {
  margin-top: 0.5em;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: left;
}
table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}


</style>
