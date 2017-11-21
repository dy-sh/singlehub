<template lang='pug'>
  v-list(dense)
    v-list-tile(v-if="stateReceived")
      v-list-tile-content
        v-list-tile-title {{uiElement.title}}
        v-list-tile-sub-title {{uiElement.subtitle}}
      v-spacer
      v-list-tile-action
        v-switch(v-model="state" color='grey lighten-3' @click='onClick')  
</template>


<script>
import getNodeStateMixin from "./mixins/getNodeState";
import sendMessageToNodeMixin from "./mixins/sendMessageToNode";

export default {
  mixins: [getNodeStateMixin, sendMessageToNodeMixin],
  props: ["uiElement"],
  data() {
    return {
      state: null,
      stateReceived: false
    };
  },
  methods: {
    onClick() {
      this.state = !this.state;
      this.sendMessageToNode({ state: this.state });
    }
  }
};
</script>
