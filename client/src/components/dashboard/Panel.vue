<template lang='pug'>
v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
  v-card(color='grey darken-3')
    v-toolbar(color='blue darken-2' dense)
      v-toolbar-title {{title}}
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
  data: () => ({
    title: "My Device",
    subPanels: [
      {
        title: "Living room",
        nodes: [
          { component: "uiButtonNode", id: 1 },
          { component: "uiButtonNode", id: 2 },
          { component: "uiSwitchNode", id: 3 }
        ]
      },
      {
        title: "Kitchen",
        nodes: [
          { component: "uiSwitchNode", id: 4 },
          { component: "uiSwitchNode", id: 5 }
        ]
      }
    ]
  }),
  components: Nodes
};
</script>

