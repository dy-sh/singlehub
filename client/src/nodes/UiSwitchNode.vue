<template lang='pug'>
v-list-tile
  v-list-tile-content
    v-list-tile-title {{uiElement.title}}
    v-list-tile-sub-title {{uiElement.subtitle}}
  v-spacer
  v-list-tile-action
    v-switch(v-model="value" color='grey lighten-3' @click='onClick')  
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

      this.$socket.emit("nodeMessageToServer", {
        cid: this.uiElement.containerId,
        id: this.uiElement.nodeId,
        value: this.value
      });
    }
  },
  sockets: {
    nodeMessageToDashboard(data) {
      console.log("UiSwitchNode nodeMessageToDashboard", JSON.stringify(data));
      if (
        this.uiElement.containerId === data.cid &&
        this.uiElement.nodeId === data.id
      ) {
        this.value = data.value;
        console.log("updated: " + this.value);
      }
    }
  }
};
</script>


<style>

</style>