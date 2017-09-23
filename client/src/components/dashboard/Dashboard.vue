<template lang='pug'>
div
  toolbar(:panels="panels")
  main
    v-content    
      v-container(grid-list-xl)
        v-layout(row wrap)
          panel(:panel="activePanel")



</template>


<script>
import Panel from "./Panel.vue";
import Toolbar from "../Toolbar.vue";

export default {
  data: () => ({
    panels: [
      // { icon: "subscriptions", title: "Dashboard", name: "Dashboard" },
      // { icon: "trending_up", title: "Editor", name: "Editor" }
    ],
    activePanel: {
      icon: "subscriptions",
      title: "TestPanel",
      name: "TestPanel"
    }
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

