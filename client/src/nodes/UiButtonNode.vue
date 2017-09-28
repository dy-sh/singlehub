<template lang='pug'>
  v-list-tile
    v-list-tile-content
      v-list-tile-title {{title}}
      //- v-list-tile-sub-title Hangouts message
    v-spacer
    v-list-tile-action
      v-btn(color='blue darken-2', @click='onClick') ON   
</template>


<script>
export default {
  data() {
    return {
      title: "Curtains"
    };
  },
  props: ["id"],
  methods: {
    onClick() {
      console.log("click " + this.id);
    }
  }
};
</script>


<style>

</style>