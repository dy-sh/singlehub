<template lang='pug'>
  v-list-tile
    v-list-tile-content
      v-list-tile-title {{uiElement.title}}
      v-list-tile-sub-title {{uiElement.subtitle}}
    v-spacer
    v-list-tile-action
      v-switch(v-model="state" color='grey lighten-3' @click='onClick')  
</template>


<script>
export default {
  props: ["uiElement"],
  data() {
    return {
      state: this.uiElement.state
    };
  },
  methods: {
    onClick() {
      this.state = !this.state;
      // console.log("UiSwitchNode click " + this.id + " : " + this.state);

      this.$socket.emit("nodeMessageToServerSide", {
        cid: this.uiElement.cid,
        id: this.uiElement.id,
        message: { state: this.state }
      });
    }
  },
  sockets: {
    nodeMessageToDashboardSide(data) {
      // console.log("UiSwitchNode nodeMessageToDashboardSide", JSON.stringify(data));
      if (this.uiElement.cid === data.cid && this.uiElement.id === data.id) {
        this.state = data.message.state;
      }
    }
  }
};
</script>
