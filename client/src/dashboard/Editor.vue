<template lang='pug'>
  div.editor.elevation-5
    #main


</template>


<script>
require("../../../dist/public/js/editor/editor.js");

export default {
  props: ["cid"],
  data: () => ({}),
  mounted() {
    console.log("mounted");
    editor.start();
  }
};
</script>

<style>

</style>