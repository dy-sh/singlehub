<template lang='pug'>
  v-list-tile
    v-list-tile-content
      v-list-tile-title {{uiElement.title}}
      v-list-tile-sub-title {{uiElement.subtitle}}
    v-spacer
    v-list-tile-action
      v-btn(color='blue darken-2', @click='onClick') ON   
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
      this.$socket.emit("nodeMessageToServerSide", {
        cid: this.uiElement.cid,
        id: this.uiElement.id,
        message: { click: true }
      });
    }
  }
};
</script>
