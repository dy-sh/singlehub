<template lang='pug'>
div
  toolbar(:panels="panels" :selected="activePanel" @click="onClickToolbar")
  main
    v-content
      v-container(grid-list-xl)
        v-layout(row wrap)
          v-flex(v-if="activePanel" xs12 sm6 md4)
            //- v-flex(v-if="activePanel" xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
            panel(:name="activePanel" v-if="activePanel")
          v-flex(v-if="activePanel" xs12 sm6 md8)
            editor


</template>


<script>
import Panel from "./Panel.vue";
import Toolbar from "./Toolbar.vue";
import Editor from "./Editor.vue";

export default {
  data: () => ({
    panels: [
      // { icon: "subscriptions", title: "Dashboard", name: "Dashboard" },
      // { icon: "trending_up", title: "Editor", name: "Editor" }
    ],
    activePanel: "Test panel"
    // {
    //   icon: "subscriptions",
    //   title: "TestPanel",
    //   name: "TestPanel"
    // }
  }),
  components: {
    panel: Panel,
    toolbar: Toolbar,
    editor: Editor
  },
  created() {
    this.$socket.emit("getUiPanelsList");
  },
  sockets: {
    getUiPanelsList(data) {
      console.log("getUiPanelsList: " + JSON.stringify(data));
      this.panels = data;

      //if active panel removed, close panel
      if (!this.panels.some(x => x.name == this.activePanel))
        this.activePanel = "";

      //for testing - open first panel
      if (this.activePanel == "") this.activePanel = this.panels[0].name;
    },
    getUiPanel(panel) {
      if (panel) this.activePanel = panel.name;
      else this.activePanel = "";
    }
  },
  methods: {
    onClickToolbar(panelName) {
      console.log(panelName);

      if (this.activePanel === panelName)
        this.$socket.emit("getUiPanel", panelName);
      else this.activePanel = panelName;
    }
  }
};
</script>

