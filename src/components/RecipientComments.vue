<template>
  <div class="comments">
    <v-subheader>{{ $t('Recipient comments')}}</v-subheader>

    <RecipientComment v-for="(recipient, index) in ordered_recipients" :key="`comment_${index}`" :recipient="recipient"
      @comment_updated="$emit('comment_updated')" />



  </div>
</template>

<script>

import RecipientComment from '@/components/RecipientComment.vue'
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'RecipientComments',
  props: {
    application: Object
  },
  components: {
    RecipientComment
  },
  mixins: [
    IdUtils
  ],
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
