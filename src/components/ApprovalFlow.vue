<template>
  <div class="approval_flow">

    <div class="approval_flow_header">
      <span class="mdi mdi-account"/>
      <span class="mdi mdi-arrow-right"/>
      <span class="mdi mdi-account"/>
      <span class="mdi mdi-arrow-right"/>
      <span class="mdi mdi-account"/>
    </div>

    <!-- using v-bind:list instead of v-model because array passed as prop -->
    <draggable class="actual_approval_flow" v-bind:list="employees" v-if="employees.length > 0">
      <!-- for loop outside the actual employee to add arrows -->
      <div
        class="flow_item"
        v-for="(employee, index) in employees"
        v-bind:key="employee._fields[0].identity.low">


        <span v-if="index>0" class="arrow mdi mdi-arrow-right"/>

        <!-- the actual employee -->
        <div class="employee">
          <span class="delete_button mdi mdi-close" v-on:click="$emit('deleteEmployee',index)"/>
          <div class="name">{{employee._fields[0].properties.name_kanji}}</div>
          <div class="name">({{employee._fields[0].properties.role}})</div>
        </div>
      </div>
    </draggable>



    <div class="flow_empty" v-else>
      承認者が選ばれていません　/　No recipient selected
    </div>


  </div>
</template>

<script>
// Tools
import draggable from 'vuedraggable'

export default {
  name: 'ApprovalFlow',
  components: {
    draggable,
  },
  props: {
    employees: Array
  },
}
</script>

<style scoped>

.approval_flow {
  margin: 0 15px;
  border: 1px solid #dddddd;
}



.approval_flow_header {
  padding: 10px;
  border-bottom: 1px solid #dddddd;

}


.actual_approval_flow {
  display: flex;
  flex-wrap: wrap;
}

/* DIRTY */
.flow_empty{
  padding: 10px;
}

.flow_item{
  display: flex;
  align-items: center;
}

.arrow {
  font-size: 150%;
}
.employee{
  /* used to position delete button */
  position: relative;

  border: 1px solid #dddddd;
  border-radius: 5px;
  margin: 10px;
  padding: 15px;

  width: 120px;

  text-align: center;

  transition: border-color 0.25s;
  //cursor: pointer;

}

.employee:hover{
  //border-color: #444444;
}

.employee > *{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete_button {
  opacity: 0;
  position: absolute;
  font-size: 120%;
  top: 0;
  right: 0;
  padding: 2px;
  cursor: pointer;

  transition: color 0.25s, opacity 0.25s;
}

.employee:hover .delete_button{
  opacity: 1;
}


.delete_button:hover {
  color: #c00000;
}





</style>
