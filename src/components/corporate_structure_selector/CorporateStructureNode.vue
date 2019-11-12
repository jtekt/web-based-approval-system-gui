<template>
  <div class="company_structure_node">


    <div class="current_node_container">

      <div
        class="expand_button"
        v-if="node_data.children"
        v-on:click="expanded = !expanded">
        {{button_text}}</div>

      <div class="node_name_container" v-on:click="$emit('select_node',node_data.node_id)">
        {{node_data.name}}
      </div>

    </div>

    <!-- The children nodes -->

    <div
      v-if="expanded"
      class="children_container">

      <div v-for="child in node_data.children">

        <div class="children_marker"></div>

        <CorporateStructureNode
          v-on:select_node="$emit('select_node',$event)"
          v-bind:node_data="child"/>
      </div>
    </div>

   </div>
</template>

<script>
import CorporateStructureNode from './CorporateStructureNode.vue'


export default {
  name: 'CorporateStructureNode',
  components: {
    CorporateStructureNode,
  },
  props: {
    node_data: Object,
  },
  data(){
    return{
      expanded: false,
    }
  },
  methods: {

  },
  computed: {
    button_text(){
      if(this.expanded) return "-"
      else return "+"
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


.company_structure_node {
  margin: 2px;
}

.expand_button{
  cursor: pointer;

  width: 20px;
  height: 20px;

  /* center button in div */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  background: #c00000;
  color: white;
  border-radius: 5px;
}

.current_node_container {
  display: flex;
  align-items: center;
}

.node_name_container {
  cursor: pointer;
  margin-left: 10px;
}

.node_name_container:hover{
  color: #c00000;
}

.children_container{
  display: flex;
  flex-direction: column;
}

.children_container > div {
  display: flex;
  align-items: flex-start;
}

.children_marker {
  width: 30px;
  text-align: center;
}



</style>
