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
  props: [
    "selectedContainer" //{id,name}
  ],
  components: components,
  data: () => ({
    nodesCustomComponents: Object.keys(NodesCustomComponents),
    editor: null
  }),
  mounted() {
    console.log("VUE EDITOR MOUNTED");

    this.editor = new Editor(0);
    window.vueEditor = this;
    this.editor.on("changeContainer", cont => {
      this.$emit("changeContainer", cont, editor);
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
  }
};
</script>

