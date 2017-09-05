<template lang="pug">
v-app#inspire(dark)
  toolbar       
  router-view
</template>

<script>
import Toolbar from "./components/init/Toolbar.vue";

export default {
  components: {
    toolbar: Toolbar
  }
};
</script>
