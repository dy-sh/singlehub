<template lang='pug'>
  v-list-tile
    v-list-tile-content
      v-list-tile-title {{uiElement.title}}
      v-list-tile-sub-title {{uiElement.subtitle}}
    v-spacer
    v-list-tile-action
      v-btn(color='blue darken-2', @click='onClick') {{state.buttonText}}   
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
      this.$socket.emit("nodeMessageToServerSide", {
        cid: this.uiElement.cid,
        id: this.uiElement.id,
        message: { click: true }
      });
    }
  },
  sockets: {
    nodeMessageToDashboardSide(data) {
      if (this.uiElement.cid === data.cid && this.uiElement.id === data.id) {
        this.state = data.message.state;
      }
    }
  }
};
</script>
