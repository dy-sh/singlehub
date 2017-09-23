<template lang='pug'>
v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
  v-card(color='grey darken-3')
    v-toolbar(color='blue darken-2' dense)
      v-toolbar-title {{panel.title}}
      v-spacer
      v-toolbar-side-icon
    v-divider
    div(v-for="subPanel in subPanels")
      v-list(subheader)
        v-subheader {{subPanel.title}}
        div(v-for="uiElement in subPanel.uiElements")
          component(:is="uiElement.type", :id="uiElement.id")
      v-divider

</template>


<script>
import Nodes from "./nodes";

export default {
  props: ["panel"],
  data: () => ({
    subPanels: [
      {
        title: "Living room",
        uiElements: [
          { type: "UiButtonNode", id: 1 },
          { type: "UiButtonNode", id: 2 },
          { type: "UiSwitchNode", id: 3 }
        ]
      },
      {
        title: "Kitchen",
        uiElements: [
          { type: "UiSwitchNode", id: 4 },
          { type: "UiSwitchNode", id: 5 }
        ]
      }
    ]
  }),
  watch: {
    panel() {
      console.log("update", this.panel.name);
      this.$socket.emit("getUiPanel", this.panel.name);
    }
  },
  components: Nodes,
  mounted() {
    console.log(this.panel.name);
    this.$socket.emit("getUiPanel", this.panel.name);
  },
  sockets: {
    getUiPanel(panel) {
      console.log("getUiPanel: " + JSON.stringify(panel));
      this.subPanels = panel.subPanels;
    }
  }
};
</script>

