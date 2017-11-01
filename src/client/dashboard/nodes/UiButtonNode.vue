<template lang='pug'>
  v-list(dense)
    v-list-tile(v-if="stateReceived")
      v-list-tile-content
        v-list-tile-title {{uiElement.title}}
        v-list-tile-sub-title {{uiElement.subtitle}}
      v-spacer
      v-list-tile-action
        v-btn(color='primary', @click='onClick') {{state.buttonText}}   
</template>


<script>
import getNodeStateMixin from "./mixins/getNodeState";
import sendMessageToNodeeMixin from "./mixins/sendMessageToNode";

export default {
  mixins: [getNodeStateMixin, sendMessageToNodeeMixin],
  props: ["uiElement"],
  data() {
    return {
      state: null,
      stateReceived: false
    };
  },
  methods: {
    onClick() {
      this.sendMessageToNode({ click: true });
    }
  }
};
</script>
