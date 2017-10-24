<template lang='pug'>
  div.editor.elevation-5
    #main
    v-toolbar(dense height="42px")
      v-btn(icon v-if="selectedContainer && selectedContainer.id!=0" @click="editor.closeContainer()")
        v-icon chevron_left
      div(v-if="selectedContainer") {{selectedContainer.name}}
      v-spacer  
      v-btn(icon v-if="!showIOValues" @click="toggleShowIOValues")
        v-icon remove_red_eye
      v-btn.blue--text.text--lighten-1(icon v-if="showIOValues" @click="toggleShowIOValues")
        v-icon remove_red_eye  
      v-btn(icon v-if="!isRunning" @click="editor.run()")
        v-icon play_arrow
      v-btn(icon v-if="isRunning" @click="editor.stop()")
        v-icon pause
      v-btn(icon :disabled="isRunning" @click="editor.step()" )
        v-icon skip_next                
    node-settings(ref="nodeSettings")
    div(v-for="node in nodesCustomComponents")
      component(:is="node", :ref="node")
</template>


<script>
// require("../../../dist/public/js/editor/editor.js");
import { Editor } from "../../public/js/editor/editor";
import NodesCustomComponents from "./nodes-custom-components/list";
import NodesSettings from "./node-settings/NodeSettings";

//merge components
let components = Object.assign({}, NodesCustomComponents, {
  "node-settings": NodesSettings
});

export default {
  props: [
    "selectedContainer" //{id,name}
  ],
  components: components,
  data: () => ({
    nodesCustomComponents: Object.keys(NodesCustomComponents),
    editor: null,
    isRunning: true,
    showIOValues: false
  }),
  mounted() {
    console.log("VUE EDITOR MOUNTED");

    this.editor = new Editor(0);
    window.vueEditor = this;

    this.editor.on("changeContainer", cont => {
      this.$emit("changeContainer", cont, editor);
    });

    this.editor.on("run", cont => {
      this.isRunning = true;
      this.$emit("run", editor);
    });

    this.editor.on("stop", cont => {
      this.isRunning = false;
      this.$emit("stop", editor);
    });

    this.editor.connect();
  },
  beforeDestroy() {
    console.log("VUE EDITOR DESTROY");
    this.editor.disconnect();
  },
  watch: {
    selectedContainer: function(cont) {
      console.log("watch", cont.id);
      if (cont.id == -1) editor.closeContainer();
      else editor.openContainer(cont.id);
    }
  },
  methods: {
    toggleShowIOValues() {
      this.showIOValues = !this.showIOValues;
      if (this.showIOValues) this.editor.displayNodesIOValues();
      else this.editor.hideNodesIOValues();
    }
  }
};
</script>

