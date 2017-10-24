<template lang='pug'>
  v-list-tile(v-if="stateReceived")
    v-list-tile-content
      v-list-tile-title {{uiElement.title}}
      v-list-tile-sub-title {{uiElement.subtitle}}
    v-spacer
    v-chip(label outline color="blue") {{state}}   
</template>


<script>
import getNodeStateMixin from "./mixins/getNodeState";

export default {
  mixins: [getNodeStateMixin],
  props: ["uiElement"],
  data() {
    return {
      state: null,
      stateReceived: false
    };
  }
};
</script>
