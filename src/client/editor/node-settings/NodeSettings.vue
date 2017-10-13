<template lang='pug'>
    v-dialog(v-model='visible', transition="slide-y-transition" persistent)
      v-card(v-if="node")
        v-card-title.headline {{node.title}} {{node.id}} 
        v-card-text
          div(v-for="setting in node.settings")
            component(:is="setting.type", :value="setting.value", :description="setting.description")
        v-card-actions
          v-spacer
          v-btn(color="gray darken-1" flat @click='hide') Cancel
          v-btn(color="blue darken-1" flat @click='save') Save
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
    hide() {
      this.visible = false;
      this.node = null;
    },
    save() {
      this.$socket.emit("nodeSettings", {
        cid: this.node.cid,
        id: this.node.id,
        settings: this.node.settings
      });
      this.hide();
    }
  }
};
</script>
