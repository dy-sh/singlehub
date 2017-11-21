<template lang='pug'>
  v-container(v-if="stateReceived" grid-list-xs)
    v-layout(row wrap)
      v-flex
        div.pt-3.pl-2 {{uiElement.title}}
        //- v-card.mt-2.ml-2(class="rgb-preview" flat)
        //-   v-card-media(height="100px" v-bind:style="{ background: `rgb(${r}, ${g}, ${b})` }")        
      v-flex(text-xs-right)
        div
          v-slider(v-model="r", color="red lighten-2", max=255,min=0, hide-details)
          v-slider(v-model="g", color="green lighten-2", max=255,min=0, hide-details)
          v-slider(v-model="b", color="blue lighten-2", max=255,min=0, hide-details)  
          v-slider(v-model="w", color="grey", max=255,min=0, hide-details)  
      v-flex(text-xs-right xs1)
        v-card.mt-4(class="rgb-preview" flat)
          v-card-media(height="110px" v-bind:style="{ background: `rgb(${r}, ${g}, ${b})` }")
</template>


<script>
import getNodeStateMixin from "./mixins/getNodeState";
import sendMessageToNodeMixin from "./mixins/sendMessageToNode";

export default {
  mixins: [getNodeStateMixin, sendMessageToNodeMixin],
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
.rgb-preview {
  width: 5px;
}
</style>