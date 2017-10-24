<template lang='pug'>
  v-list-tile
    v-list-tile-content
      v-list-tile-title {{uiElement.title}}
      v-list-tile-sub-title {{uiElement.subtitle}}
    v-spacer
    v-chip(label outline color="blue") {{state}}   
</template>


<script>
export default {
  props: ["uiElement"],
  data() {
    return {
      state: this.uiElement.state
    };
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
