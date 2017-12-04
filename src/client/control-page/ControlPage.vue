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
      root-nodes
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
import RootNodes from "./root-nodes/RootNodes";

export default {
  components: {
    "dashboard-panel": DashboardPanel,
    toolbar: Toolbar,
    sidebar: Sidebar,
    editor: Editor,
    "root-nodes": RootNodes
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
    editorIsVisible: true,
    sidebarIsVisible: true,
    editorContainers: [], //[{id,name},{id,name}]
    selectedEditorContainer: { id: 0, name: "Main" } //{id,name}
  }),
  mounted() {
    this.$socket.emit("getUiPanelsList");

    // setTimeout(() => {
    //   this.editorIsVisible = true;
    // }, 700);

    if (this.$cookie.get("dashboardIsVisible"))
      this.dashboardIsVisible =
        this.$cookie.get("dashboardIsVisible") == "true";
    if (this.$cookie.get("editorIsVisible"))
      this.editorIsVisible = this.$cookie.get("editorIsVisible") == "true";
    if (this.$cookie.get("sidebarIsVisible"))
      this.sidebarIsVisible = this.$cookie.get("sidebarIsVisible") == "true";
  },
  sockets: {
    getUiPanelsList(data) {
      console.log("getUiPanelsList: " + JSON.stringify(data));
      this.dashboardPanels = data;

      //open last panel
      this.activePanel = this.$cookie.get("activePanel") || "";

      //if active panel removed, close panel
      if (!this.dashboardPanels.some(x => x.name == this.activePanel))
        this.activePanel = "";
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
      this.$cookie.set("sidebarIsVisible", this.sidebarIsVisible, 365);
    },
    onClickToolbarDashboard() {
      this.dashboardIsVisible = !this.dashboardIsVisible;
      this.$cookie.set("dashboardIsVisible", this.dashboardIsVisible, 365);
    },
    onClickToolbarEditor() {
      this.editorIsVisible = !this.editorIsVisible;
      this.$cookie.set("editorIsVisible", this.editorIsVisible, 365);
    },
    onSelectPanel(panelName) {
      this.activePanel = this.activePanel === panelName ? "" : panelName;
      this.$cookie.set("activePanel", this.activePanel, 365);
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

/* --------------- scrollbars ---------------- */
.vb > .vb-dragger {
  z-index: 5;
  width: 12px;
  right: 0;
}

.vb > .vb-dragger > .vb-dragger-styler {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: rotate3d(0, 0, 0, 0);
  transform: rotate3d(0, 0, 0, 0);
  -webkit-transition: background-color 100ms ease-out, margin 100ms ease-out,
    height 100ms ease-out;
  transition: background-color 100ms ease-out, margin 100ms ease-out,
    height 100ms ease-out;
  background-color: rgba(121, 121, 121, 0.1);
  margin: 5px 5px 5px 0;
  border-radius: 20px;
  height: calc(100% - 10px);
  display: block;
}

.vb.vb-scrolling-phantom > .vb-dragger > .vb-dragger-styler {
  background-color: rgba(121, 121, 121, 0.3);
}

.vb > .vb-dragger:hover > .vb-dragger-styler {
  background-color: rgba(121, 121, 121, 0.5);
  margin: 0px;
  height: 100%;
}

.vb.vb-dragging > .vb-dragger > .vb-dragger-styler {
  background-color: rgba(121, 121, 121, 0.5);
  margin: 0px;
  height: 100%;
}

.vb.vb-dragging-phantom > .vb-dragger > .vb-dragger-styler {
  background-color: rgba(121, 121, 121, 0.5);
}
/* --------------- ---------- ---------------- */
</style>