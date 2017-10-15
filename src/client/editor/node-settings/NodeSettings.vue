<template lang='pug'>
    v-dialog(v-model='visible', transition="slide-y-transition")
      v-card(v-if="settings")
        v-card-title.headline {{title}} 
        v-card-text
          div(v-for="setting in settings")
            component(:is="setting.type", :setting="setting")
        v-card-actions
          v-spacer
          v-btn(color="gray darken-1" flat @click='visible = false') Cancel
          v-btn(color="blue darken-1" flat @click='save') Save
</template>


<script>
import SettingString from "./SettingString";

export default {
  // props: ["show"],
  data() {
    return {
      visible: false,
      id: 0,
      cid: 0,
      title: "",
      settings: null
    };
  },
  components: {
    string: SettingString
  },
  methods: {
    show(node) {
      this.settings = JSON.parse(JSON.stringify(node.settings));
      this.id = node.id;
      this.cid = node.cid;
      this.title = node.title;
      this.visible = true;
    },
    save() {
      this.$socket.emit("nodeSettings", {
        cid: this.cid,
        id: this.id,
        settings: this.settings
      });
      this.visible = false;
      this.settings = null;
    }
  }
};
</script>
