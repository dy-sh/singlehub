<template lang='pug'>
  div
    v-list(dense)
      v-list-tile(v-if="stateReceived" height=300)
        v-list-tile-content
          v-list-tile-title {{uiElement.title}}
          v-list-tile-sub-title {{uiElement.subtitle}}
        v-list-tile-content.slider-parent
          v-slider.slder(v-model="sliderValue", color="primary", max=100,min=0, hide-details)
</template>


<script>
import getNodeStateMixin from "./mixins/getNodeState";
import sendMessageToNodeeMixin from "./mixins/sendMessageToNode";

export default {
  mixins: [getNodeStateMixin, sendMessageToNodeeMixin],
  props: ["uiElement"],
  data() {
    return {
      sliderValue: 0,
      state: null,
      stateReceived: false
    };
  },
  watch: {
    state(val) {
      // console.log("state", val);
      this.sliderValue = val;
    },
    sliderValue(val) {
      // console.log("sliderValue", val);

      //rpevent loop sending
      if (this.state != val) {
        this.state = val;
        this.sendMessageToNode({ state: this.state });
      }
    }
  }
};
</script>

<style scoped>
.slider-parent {
  height: 50px;
}
.slder {
  /* top: -20px; */
  padding-left: 12px !important;
}
</style>