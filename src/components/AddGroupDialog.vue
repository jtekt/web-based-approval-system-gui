<template>
  <v-dialog
      v-model="dialog"
      width="500">

      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="black"
          dark
          v-bind="attrs"
          v-on="on" >
          <v-icon>mdi-account-plus</v-icon>
          <span class="ml-2">Add Group</span>
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          Add a user
        </v-card-title>

        <v-card-text>
          <GroupPicker
            @selection="group_selected($event)"/>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import GroupPicker from '@moreillon/vue_group_picker'

export default {
  name: 'AddGroupDialog',
  components: {
    GroupPicker
  },
  data(){
    return {
      dialog: false,
    }
  },

  methods: {
    group_selected(group){
      this.$emit('selection', group)
      this.dialog = false
    },
  }
}
</script>
