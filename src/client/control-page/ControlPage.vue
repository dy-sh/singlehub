<template lang='pug'>
div

  toolbar(
    :dashboardIsVisible="dashboardIsVisible",
    :editorIsVisible="editorIsVisible",
    @clickSidebar="onClickToolbarSidebar",
    @clickDashboard="onClickToolbarDashboard",
    @clickEditor="onClickToolbarEditor")

  sidebar(
    :sidebarIsVisible="sidebarIsVisible",
    :dashboardIsVisible="dashboardIsVisible",
    :editorIsVisible="editorIsVisible",

    :dashboardPanels="dashboardPanels",
    :selectedDashboardPanel="activePanel",
    @selectPanel="onSelectPanel",  

    :editorContainers="editorContainers",
    :selectedEditorContainer="selectedEditorContainer",
    @selectContainer="onSelectContainer")    

  main
    v-content.dash
      //- v-container(fluid)
      div(v-if="dashboardIsVisible && editorIsVisible")
        v-layout(row wrap)
          v-flex(xs12 sm6 md4)
            //- v-flex(v-if="activePanel" xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
            dashboard-panel.panel(v-if="activePanel" :name="activePanel")
            div.text-xs-center.pt-5.grey--text.text--darken-2(v-else) {{noPanelMessage}}
          v-flex(xs12 sm6 md8)
            editor.editor(
              :selectedContainer="selectedEditorContainer",
              @changeContainer="onEditorChangeContainer")
      div(v-if="!dashboardIsVisible && editorIsVisible")
        editor.editor(
          :selectedContainer="selectedEditorContainer",
          @changeContainer="onEditorChangeContainer")           
      div(v-if="dashboardIsVisible && !editorIsVisible")
        v-layout(row wrap)
          v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
            dashboard-panel.panel(v-if="activePanel" :name="activePanel")
            div.text-xs-center.pt-5.grey--text.text--darken-2(v-else)  {{noPanelMessage}}

</template>


<script>
import DashboardPanel from "../dashboard/DashboardPanel";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import Editor from "../editor/Editor";

export default {
  components: {
    "dashboard-panel": DashboardPanel,
    toolbar: Toolbar,
    sidebar: Sidebar,
    editor: Editor
  },
  data: () => ({
    dashboardPanels: [
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
    editorIsVisible: false,
    sidebarIsVisible: true,
    editorContainers: [], //[{id,name},{id,name}]
    selectedEditorContainer: { id: 0, name: "Main" } //{id,name}
  }),
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
      this.dashboardPanels = data;

      //if active panel removed, close panel
      if (!this.dashboardPanels.some(x => x.name == this.activePanel))
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
      return !this.dashboardPanels || this.dashboardPanels.length == 0
        ? "NO PANELS CREATED"
        : "SELECT THE PANEL FROM THE LIST";
    }
  },
  methods: {
    onClickToolbarSidebar() {
      this.sidebarIsVisible = !this.sidebarIsVisible;
    },
    onClickToolbarDashboard() {
      this.dashboardIsVisible = !this.dashboardIsVisible;
    },
    onClickToolbarEditor() {
      this.editorIsVisible = !this.editorIsVisible;
    },
    onSelectPanel(panelName) {
      if (this.activePanel === panelName)
        this.$socket.emit("getUiPanel", panelName);
      else this.activePanel = panelName;
    },
    onEditorChangeContainer(container, editor) {
      console.log("onEditorChangeContainer", container.name);
      this.selectedEditorContainer = { name: container.name, id: container.id };
      let contNodes = container.getNodesByType("main/container");
      let list = [];
      contNodes.forEach(node => {
        list.push({ id: node.sub_container.id, name: node.sub_container.name });
      });
      this.editorContainers = list;
    },
    onSelectContainer(cont) {
      this.selectedEditorContainer = cont;
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