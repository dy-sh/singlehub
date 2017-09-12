<template lang='pug'>
v-list-tile
  v-list-tile-content
    v-list-tile-title {{title}}
    //- v-list-tile-sub-title Hangouts message
  v-spacer
  v-list-tile-action
    v-switch(v-model="value" value="switch" color='grey lighten-3')  
</template>


<script>
export default {
  data() {
    return {
      title: "Ligth",
      value: true
    };
  }
};
</script>


<style>

</style>