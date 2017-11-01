<template lang='pug'>
  v-card(color='grey darken-3')
    v-toolbar(color='blue darken-2' dense height="45px")
      v-toolbar-title {{title}}
      v-spacer
      v-toolbar-side-icon
    div(v-for="subPanel in subPanels")
      //- v-subheader {{title}}
      div(v-for="uiElement in subPanel.uiElements")
        component(:is="uiElement.type", :uiElement="uiElement")

</template>


<script>
import Nodes from "./nodes/list";

export default {
  props: ["name"],
  data: () => ({
    title: "",
    // title: "Test panel",
    subPanels: [
      // {
      //   title: "Test sub-panel",
      //   uiElements: [
      //     { type: "UiSwitchNode", title: "Switch", cid: 0, id: 0, value: true },
      //     { type: "UiSwitchNode", title: "Switch2", cid: 0, id: 0 },
      //     { type: "UiButtonNode", title: "Button", cid: 0, id: 0 }
      //   ]
      // }
    ]
  }),
  watch: {
    name(val, oldVal) {
      this.leaveRoom(oldVal);
      this.joinRoom(val);
    }
  },
  components: Nodes,
  methods: {
    joinRoom(roomName) {
      //get state
      this.$socket.emit("getUiPanel", roomName);
      //join room
      console.log("Join to dashboard room [" + roomName + "]");
      this.$socket.emit("join-room", roomName);
    },
    leaveRoom(roomName) {
      //unsubsribe
      console.log("Leave dashboard room [" + roomName + "]");
      this.$socket.emit("leave-room", roomName);
    }
  },
  beforeDestroy() {
    this.leaveRoom(this.name);
  },
  mounted() {
    this.joinRoom(this.name);
  },
  sockets: {
    getUiPanel(panel) {
      //for offline develop
      if (this.title == "Test panel") return;

      console.log("getUiPanel: " + JSON.stringify(panel));
      if (panel) {
        this.title = panel.title;

        //force update!!!
        this.subPanels = null;
        this.$nextTick(() => {
          this.subPanels = panel.subPanels;
        });
      } else {
        this.title = "";
      }
    }
  }
};
</script>

