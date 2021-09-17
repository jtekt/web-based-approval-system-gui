<template>
  <div class="comments_wrapper">
    <div class="comments_header">承認者のコメント / Recipient comments</div>
    <table>

      <template v-for="(recipient, index) in ordered_recipients">

        <ApprovalComment
          :key="`comment_${index}`"
          v-if="recipient.approval || recipient.refusal"
          @comment_updated="$emit('comment_updated')"
          :recipient="recipient"/>

      </template>


    </table>
  </div>
</template>

<script>
import ApprovalComment from './ApprovalComment.vue'
export default {
  name: 'ApprovalComments',
  components: {
    ApprovalComment
  },
  props: {
    application: Object,
  },
  methods: {


  },
  computed: {
    ordered_recipients(){
      return this.application.recipients
        .slice()
        .sort((a, b) => b.submission.properties.flow_index - a.submission.properties.flow_index)
    },


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
