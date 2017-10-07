<template lang='pug'>
  div.editor.elevation-5
    #main


</template>


<script>
// require("../../../dist/public/js/editor/editor.js");
import { Editor } from "../../public/js/editor/editor";

export default {
  props: ["cid"],
  data: () => ({}),
  mounted() {
    console.log("mounted");
    let ed = new Editor();
    ed.start();
  }
};
</script>

<style>

</style>