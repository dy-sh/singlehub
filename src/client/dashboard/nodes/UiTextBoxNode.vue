<template lang='pug'>
  v-list(dense)
    v-list-tile(v-if="stateReceived" height=400)
      v-list-tile-content
        v-list-tile-title {{uiElement.title}}
        v-list-tile-sub-title {{uiElement.subtitle}}
      v-list-tile-content  
        v-text-field(v-model="state")
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
