<template>
  <button type="button"
    v-on:click="$emit('clicked')"
    v-bind:class="{bordered: bordered, disabled: disabled}"
    v-bind:disabled="disabled">
    <span class="mdi"
      v-bind:class="icon"/>
    <slot/>
  </button>
</template>

<script>
// Tools

export default {
  name: 'IconButton',
  components: {

  },
  props: {
    bordered: { type: Boolean, default () { return false } },
    icon: { type: String, default () { return 'mdi-help' } },
    disabled: { type: Boolean, default () { return false } }
  }
}
</script>

<style scoped>

button {
  font-size: 150%;
  border: none;
  background-color: transparent;
  color: #222222;
  transition: color 0.25s, border-color 0.25s;
  cursor: pointer;
}

span {

}

button:hover {

  color: #c00000;
}

button.bordered {
  border: 1px solid #222222;
  border-radius: 5px;
}

button.bordered:hover{
  border-color: #c00000;
}

button.disabled {
  cursor: not-allowed;
  color: #bbbbbb;
}

button.disabled.bordered {
  border-color: #bbbbbb;

}

</style>
