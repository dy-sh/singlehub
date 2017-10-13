<template lang='pug'>
  div.editor.elevation-5
    #main
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
  props: ["cid"],
  components: components,
  data: () => ({
    nodesCustomComponents: Object.keys(NodesCustomComponents),
    editor: null
  }),
  mounted() {
    console.log("VUE EDITOR MOUNTED");

    this.editor = new Editor(0);
    this.editor.connect();
    window.vueEditor = this;
  },
  beforeDestroy() {
    console.log("VUE EDITOR DESTROY");
    this.editor.disconnect();
  }
};
</script>

