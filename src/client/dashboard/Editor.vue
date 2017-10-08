<template lang='pug'>
  div.editor.elevation-5
    #main


</template>


<script>
// require("../../../dist/public/js/editor/editor.js");
import { Editor } from "../../public/js/editor/editor";

export default {
  props: ["cid"],
  data: () => ({
    editor: null
  }),
  mounted() {
    console.log("VUE EDITOR MOUNTED");
    this.editor = new Editor(0);
    this.editor.connect();
  },
  beforeDestroy() {
    console.log("VUE EDITOR DESTROY");
    this.editor.disconnect();
  }
};
</script>

<style>

</style>