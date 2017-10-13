<template lang='pug'>
div

  toolbar(
    :panels="panels" 
    :selected="activePanel" 
    :dashboardIsVisible="dashboardIsVisible",
    :editorIsVisible="editorIsVisible",
    @clickSidebar="onClickSidebar",
    @clickToolbarDashboard="onClickToolbarDashboard",
    @clickToolbarEditor="onClickToolbarEditor")

  main
    v-content.dash
      //- v-container(grid-list-xl)
      div(v-if="dashboardIsVisible && editorIsVisible")
        v-layout(row wrap)
          v-flex(xs12 sm6 md4)
            //- v-flex(v-if="activePanel" xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
            panel.panel(v-if="activePanel" :name="activePanel")
            div.text-xs-center.pt-5.grey--text.text--darken-2(v-else) {{noPanelMessage}}
          v-flex(xs12 sm6 md8)
            editor.editor
      div(v-if="!dashboardIsVisible && editorIsVisible")
        editor.editor           
      div(v-if="dashboardIsVisible && !editorIsVisible")
        v-layout(row wrap)
          v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
            panel.panel(v-if="activePanel" :name="activePanel")
            div.text-xs-center.pt-5.grey--text.text--darken-2(v-else)  {{noPanelMessage}}

</template>


<script>
import Panel from "./Panel.vue";
import Toolbar from "./Toolbar.vue";
import Editor from "../editor/Editor";

export default {
  data: () => ({
    panels: [
      // { icon: "subscriptions", title: "Dashboard", name: "Dashboard" },
      // { icon: "trending_up", title: "Editor", name: "Editor" }
    ],
    activePanel: "",
    // activePanel: "Test panel",
    // {
    //   icon: "subscriptions",
    //   title: "TestPanel",
    //   name: "TestPanel"
    // }
    dashboardIsVisible: true,
    editorIsVisible: false
  }),
  components: {
    panel: Panel,
    toolbar: Toolbar,
    editor: Editor
  },
  created() {
    this.$socket.emit("getUiPanelsList");
    //for testing
    setTimeout(() => {
      this.editorIsVisible = true;
    }, 700);
  },
  sockets: {
    getUiPanelsList(data) {
      console.log("getUiPanelsList: " + JSON.stringify(data));
      this.panels = data;

      //if active panel removed, close panel
      if (!this.panels.some(x => x.name == this.activePanel))
        this.activePanel = "";

      //for testing - open first panel
      // if (this.activePanel == "") this.activePanel = this.panels[0].name;
    },
    getUiPanel(panel) {
      if (panel) this.activePanel = panel.name;
      else this.activePanel = "";
    }
  },
  computed: {
    noPanelMessage: function() {
      return !this.panels || this.panels.length == 0
        ? "NO PANELS CREATED"
        : "SELECT THE PANEL FROM THE LIST";
    }
  },
  methods: {
    onClickSidebar(panelName) {
      if (this.activePanel === panelName)
        this.$socket.emit("getUiPanel", panelName);
      else this.activePanel = panelName;
    },
    onClickToolbarDashboard() {
      this.dashboardIsVisible = !this.dashboardIsVisible;
    },
    onClickToolbarEditor() {
      this.editorIsVisible = !this.editorIsVisible;
    }
  }
};
</script>

<style>
.dash {
  margin: 5px;
}
.panel {
  margin: 5px;
}

.editor {
  margin: 5px;
}
</style>