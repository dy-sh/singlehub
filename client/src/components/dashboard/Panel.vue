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
        div(v-for="node in subPanel.nodes")
          component(:is="node.component", :id="node.id")
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
        nodes: [
          { component: "UiButtonNode", id: 1 },
          { component: "UiButtonNode", id: 2 },
          { component: "UiSwitchNode", id: 3 }
        ]
      },
      {
        title: "Kitchen",
        nodes: [
          { component: "UiSwitchNode", id: 4 },
          { component: "UiSwitchNode", id: 5 }
        ]
      }
    ]
  }),
  components: Nodes,
  mounted() {
    console.log(this.panel.name);
    this.$socket.emit("getUiPanel", this.panel.name);
  },
  sockets: {
    getUiPanel(data) {
      console.log("getUiPanel: " + JSON.stringify(data));
    }
  }
};
</script>

