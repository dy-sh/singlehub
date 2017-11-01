<template lang='pug'>
  v-container(v-if="stateReceived" grid-list-xs)
    v-layout(row wrap)
      v-flex
        div.pt-3.pl-2 {{uiElement.title}}
      v-flex(text-xs-right)
        div
          v-slider(v-model="r", color="red lighten-2", max=255,min=0, hide-details)
          v-slider(v-model="g", color="green lighten-2", max=255,min=0, hide-details)
          v-slider(v-model="b", color="blue lighten-2", max=255,min=0, hide-details)  
          v-slider(v-model="w", color="grey", max=255,min=0, hide-details)  
</template>


<script>
import getNodeStateMixin from "./mixins/getNodeState";
import sendMessageToNodeeMixin from "./mixins/sendMessageToNode";

export default {
  mixins: [getNodeStateMixin, sendMessageToNodeeMixin],
  props: ["uiElement"],
  data() {
    return {
      r: 0,
      g: 0,
      b: 0,
      w: 0,
      state: null,
      stateReceived: false
    };
  },
  watch: {
    state(val) {
      this.r = val.r;
      this.g = val.g;
      this.b = val.b;
      this.w = val.w;
    },
    r(val) {
      //pevent loop sending
      if (this.state.r != val) {
        this.state.r = val;
        this.sendMessageToNode({ state: this.state });
      }
    },
    g(val) {
      //pevent loop sending
      if (this.state.g != val) {
        this.state.g = val;
        this.sendMessageToNode({ state: this.state });
      }
    },
    b(val) {
      //pevent loop sending
      if (this.state.b != val) {
        this.state.b = val;
        this.sendMessageToNode({ state: this.state });
      }
    },
    w(val) {
      //pevent loop sending
      if (this.state.w != val) {
        this.state.w = val;
        this.sendMessageToNode({ state: this.state });
      }
    }
  }
};
</script>

<style scoped>
.input-group.input-group--slider {
  height: 45px;
}
</style>