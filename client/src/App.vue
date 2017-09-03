<template lang="pug">
  v-app(light='')
    toolbar
    router-view
</template>

<script>
import Toolbar from "./components/init/Toolbar.vue";

export default {
  components: {
    toolbar: Toolbar
  },
  data() {
    return {};
  }
};
</script>
