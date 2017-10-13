<template lang='pug'>
  div.editor.elevation-5
    #main
    component(:is="node", :ref="node" v-for="node in nodesCustomComponents")


</template>


<script>
// require("../../../dist/public/js/editor/editor.js");
import { Editor } from "../../public/js/editor/editor";
import NodesCustomComponents from "./nodes-custom-components/list";

export default {
  props: ["cid"],
  components: NodesCustomComponents,
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

