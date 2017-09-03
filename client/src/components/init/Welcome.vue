<template lang='pug'>
  div
    main
      v-content
        v-container(fluid='')
          v-slide-y-transition(mode='out-in')
            v-layout(column='', align-center='')
              div Welcome
</template>


<script>
export default {
  data() {
    return {};
  }
};
</script>


<style>

</style>