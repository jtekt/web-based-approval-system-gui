<template>
  <draggable
    class="approval_flow"
    :list="recipients">

    <!--Need to have arrow and recipient in the same div because of draggable -->
    <div
      class="flow_item"
      v-for="(recipient, index) in recipients"
      :key="`flow_member_${index}`">

      <v-icon
        class="mx-2"
        v-if="index>0">
        mdi-arrow-right
      </v-icon>

      <v-chip
        close
        label
        @click:close="delete_recipient(index)">
        {{recipient.properties.display_name
        || recipient.properties.name_kanji
        || recipient.properties.full_name}}
      </v-chip>


    </div>


  </draggable>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'NewApplicationApprovalFlow',
  props: {
    recipients: Array
  },
  components: {
    draggable
  },
  methods: {
    delete_recipient(recipient_index){
      this.recipients.splice(recipient_index,1)
      //this.$emit('deleteRecipient',index)
    }
  },


}
</script>

<style scoped>

.approval_flow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.flow_item{
  /* Arrow plus chip */
  display: flex;
  align-items: center;
  margin: 1em 0;
}



</style>
