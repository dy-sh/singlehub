<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title My Device
              v-spacer
              v-toolbar-side-icon
            v-divider
            v-list(subheader)
              v-subheader Living room
              uiButtonNode
              uiSwitchNode
            v-divider
            v-list(subheader)
              v-subheader Kitchen
              uiButtonNode
              uiSwitchNode 

</template>


<script>
import UiButtonNode from "./UiButtonNode.vue";
import UiSwitchNode from "./UiSwitchNode.vue";

export default {
  data: () => ({
    sw1: true
  }),
  components: {
    uiButtonNode: UiButtonNode,
    uiSwitchNode: UiSwitchNode
  }
};
</script>

