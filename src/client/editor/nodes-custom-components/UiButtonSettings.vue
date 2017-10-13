<template lang='pug'>
    v-dialog(v-model='visible',transition="slide-y-transition")
      v-card(v-if="node")
        v-card-title.headline {{node.title}}
        v-card-text
          | Node id {{node.id}} 
          br
          v-checkbox(label="Test Value" v-model="testVal")
        v-card-actions
          v-spacer
          v-btn(color="gray darken-1" flat @click='visible = false') Cancel
          v-btn(color="blue darken-1" flat @click='onClick') Save
</template>


<script>
export default {
  // props: ["show"],
  data() {
    return {
      visible: false,
      node: null,
      testVal: false
    };
  },
  mounted() {
    // setTimeout(() => {
    //   this.visible = true;
    // }, 1000);
  },
  methods: {
    show(node) {
      this.node = node;
      this.visible = true;
    },
    onClick() {
      this.visible = false;
      this.$socket.emit("nodeMessageToServerSide", {
        cid: this.node.cid,
        id: this.node.id,
        message: {
          settings: { testVal: this.testVal }
        }
      });
    }
  }
};
</script>
