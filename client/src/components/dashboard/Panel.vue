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
        uiButtonNode
        uiSwitchNode
      v-divider

</template>


<script>
import UiButtonNode from "./UiButtonNode.vue";
import UiSwitchNode from "./UiSwitchNode.vue";

export default {
  data: () => ({
    title: "My Device",
    subPanels: [{ title: "Living room" }, { title: "Kitchen" }]
  }),
  components: {
    uiButtonNode: UiButtonNode,
    uiSwitchNode: UiSwitchNode
  }
};
</script>

