<template lang='pug'>
  #main
    //- .node-editor
    //-   .content
    //-     .editor-area
    //-       canvas.canvas.editorcanvas(width='829', height='505', tabindex='10', style='cursor: default;')


</template>


<script>
// require("../../../dist/public/js/editor/editor.js");//duplicate! see dashboard/editor

export default {
  data: () => ({}),
  mounted() {
    console.log("mounted");
    editor.start();
  }
};
</script>

<style>

</style>