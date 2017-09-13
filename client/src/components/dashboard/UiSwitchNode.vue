<template lang='pug'>
v-list-tile
  v-list-tile-content
    v-list-tile-title {{title}}
    //- v-list-tile-sub-title Hangouts message
  v-spacer
  v-list-tile-action
    v-switch(v-model="value", color='grey lighten-3', @click='onClick')  
</template>


<script>
export default {
  data() {
    return {
      title: "Ligth",
      value: true
    };
  },
  props: ["id"],
  methods: {
    onClick() {
      this.value = !this.value;
      console.log("click " + this.id + " : " + this.value);
      this.$socket.emit("node_data", { node: this.id, value: this.value });
    }
  },
  sockets: {
    connect() {
      console.log("UiSwitchNode socket connected");
    },
    customEmit(val) {
      console.log(
        'UiSwitchNode this method was fired by the socket server. eg: io.emit("customEmit", data)'
      );
    }
  }
};
</script>


<style>

</style>