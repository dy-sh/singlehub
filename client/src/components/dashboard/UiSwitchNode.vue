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
      this.$socket.emit("nodeData", { nodeId: this.id, value: this.value });
    }
  },
  sockets: {
    connect() {
      console.log("UiSwitchNode socket connected");
    },
    customEmit(val) {
      console.log("UiSwitchNode customEmit");
    },
    nodeData(data) {
      console.log("UiSwitchNode nodeData: " + JSON.stringify(data));
      if (this.id === data.nodeId) {
        this.value = data.value;
        console.log("updated: " + this.value);
      } else {
        console.log(this.id, data.nodeId);
      }
    }
  }
};
</script>


<style>

</style>