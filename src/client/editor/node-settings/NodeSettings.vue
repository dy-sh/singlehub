<template lang='pug'>
    v-dialog(v-model='visible')
      v-card(v-if="node")
        v-card-title.headline {{node.title}} {{node.id}} 
        v-card-text
          div(v-for="setting in node.settings")
            component(:is="setting.type", :setting="setting")
        v-card-actions
          v-spacer
          v-btn(color="gray darken-1" flat @click='visible = false') Cancel
          v-btn(color="blue darken-1" flat @click='onClick') Save
</template>


<script>
import SettingString from "./SettingString";

export default {
  // props: ["show"],
  data() {
    return {
      visible: false,
      node: null,
      testVal: false
    };
  },
  components: {
    string: SettingString
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
