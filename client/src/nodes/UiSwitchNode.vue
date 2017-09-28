<template lang='pug'>
v-list-tile
  v-list-tile-content
    v-list-tile-title {{uiElement.title}}
    //- v-list-tile-sub-title Hangouts message
  v-spacer
  v-list-tile-action
    v-switch(v-model="value", color='grey lighten-3', @click='onClick')  
</template>


<script>
export default {
  props: ["uiElement"],
  data() {
    return {
      value: this.uiElement.value
    };
  },
  methods: {
    onClick() {
      this.value = !this.value;
      console.log("click " + this.id + " : " + this.value);
      this.$socket.emit("node-message-to-server-side", {
        cid: this.uiElement.containerId,
        id: this.uiElement.nodeId,
        value: this.value
      });
    }
  },
  sockets: {
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