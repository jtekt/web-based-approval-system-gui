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
          <td>
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
    rejections: Array,
  },
  methods: {
    recipient_of_approval(approval){
      return this.recipients.find(recipient => {
        return JSON.stringify(approval.start) === JSON.stringify(recipient.identity)
      })
    },
    recipient_of_submission(submission){
      if(!submission) return null
      return this.recipients.find(recipient => {
        return JSON.stringify(recipient.identity) === JSON.stringify(submission.end)
      })
    },
    approval_of_recipient(recipient){
      return this.approvals.find(approval => {
        return JSON.stringify(approval.start) === JSON.stringify(recipient.identity)
      })
    },
    rejection_of_recipient(recipient){
      return this.rejections.find(rejection => {
        return JSON.stringify(rejection.start) === JSON.stringify(recipient.identity)
      })
    },
    approval_or_rejection_of_recipient(recipient){
      return this.approval_of_recipient(recipient) || this.rejection_of_recipient(recipient)
    },

  },
  computed: {
    submissions_with_comment(){
      return this.submissions.filter(submission => {
        let recipient = this.recipient_of_submission(submission)
        let approval_or_rejection = this.approval_or_rejection_of_recipient(recipient)
        if(!approval_or_rejection) return false
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
