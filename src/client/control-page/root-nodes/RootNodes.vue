<template lang='pug'>
    div
      div(v-for="node in nodes")
        component(:is="node")
</template>


<script>
import RootNodes from "./list";

export default {
  data: () => ({
    nodes: RootNodes
  }),
  components: RootNodes
};
</script>

