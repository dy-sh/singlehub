<template lang='pug'>
  v-list.parrent(dense)
    v-list-tile(v-if="stateReceived")
      v-list-tile-content
        v-list-tile-title {{uiElement.title}}
        v-list-tile-sub-title {{uiElement.subtitle}}
      v-list-tile-content.textfield
        v-text-field(v-model="state" @input='onChange')
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
    onChange() {
      this.sendMessageToNode({ state: this.state });
    }
  }
};
</script>

<style scoped>
.textfield {
  height: 50px !important;
}
.parrent {
  height: 60px !important;
}
</style>