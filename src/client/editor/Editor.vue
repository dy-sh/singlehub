<template lang='pug'>
  div.editor.elevation-5
    #main
    component(:is="setting", :ref="setting" v-for="setting in settingsTemplates")


</template>


<script>
// require("../../../dist/public/js/editor/editor.js");
import { Editor } from "../../public/js/editor/editor";
import NodesSettings from "./nodes-settings/list";

export default {
  props: ["cid"],
  components: NodesSettings,
  data: () => ({
    settingsTemplates: Object.keys(NodesSettings),
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

