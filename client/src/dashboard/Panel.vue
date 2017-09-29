<template lang='pug'>
v-flex(v-if="title" xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
  v-card(color='grey darken-3')
    v-toolbar(color='blue darken-2' dense)
      v-toolbar-title {{title}}
      v-spacer
      v-toolbar-side-icon
    v-divider
    div(v-for="subPanel in subPanels")
      v-list(subheader)
        //- v-subheader {{title}}
        div(v-for="uiElement in subPanel.uiElements")
          component(:is="uiElement.type", :uiElement="uiElement")
      v-divider

</template>


<script>
import Nodes from "../nodes/nodes";

export default {
  props: ["name"],
  data: () => ({
    title: "",
    subPanels: [
      // {
      //   title: "Living room",
      //   uiElements: [
      //     { type: "UiButtonNode", id: 1 },
      //     { type: "UiButtonNode", id: 2 },
      //     { type: "UiSwitchNode", id: 3 }
      //   ]
      // },
      // {
      //   title: "Kitchen",
      //   uiElements: [
      //     { type: "UiSwitchNode", id: 4 },
      //     { type: "UiSwitchNode", id: 5 }
      //   ]
      // }
    ]
  }),
  watch: {
    name() {
      console.log("update", this.name);
      this.$socket.emit("getUiPanel", this.name);
    }
  },
  components: Nodes,
  mounted() {
    console.log(this.name);
    this.$socket.emit("getUiPanel", this.name);
  },
  sockets: {
    getUiPanel(panel) {
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

