<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        panel
        panel


</template>


<script>
import Panel from "./Panel.vue";

export default {
  data: () => ({}),
  components: {
    panel: Panel
  }
};
</script>

