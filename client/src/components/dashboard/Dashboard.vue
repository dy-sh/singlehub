<template lang='pug'>
div
  toolbar(:panels="panels")
  main
    v-content    
      v-container(grid-list-xl)
        v-layout(row wrap)
          //- panel(id="0")



</template>


<script>
import Panel from "./Panel.vue";
import Toolbar from "../Toolbar.vue";

export default {
  data: () => ({
    panels: [
      { icon: "subscriptions", title: "Dashboard", name: "Dashboard" },
      { icon: "trending_up", title: "Editor", name: "Editor" }
    ]
  }),
  components: {
    panel: Panel,
    toolbar: Toolbar
  },
  created() {
    this.$socket.emit("getUiPanelsList");
  },
  sockets: {
    getUiPanelsList(data) {
      this.panels = data;
      console.log("getUiPanelsList: " + JSON.stringify(data));
    }
  }
};
</script>

