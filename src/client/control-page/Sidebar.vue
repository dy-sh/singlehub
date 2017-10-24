<template lang='pug'>
  v-navigation-drawer(v-if="sidebarIsVisible" permanent clipped app width=170)
    //- v-navigation-drawer(persistent clipped enable-resize-watcher v-model='drawer' app width=200)
    v-list(dense v-if="dashboardIsVisible")
      v-subheader.mt-3.grey--text.text--darken-1 DASHBOARD
      v-list-tile(v-for='panel in dashboardPanels' :key='panel.name' @click='onSelectPanel(panel.name)')
        v-list-tile-action.panel-icon
          v-icon(:class="{'blue--text': panel.name==selectedDashboardPanel,'text--lighten-1':panel.name==selectedDashboardPanel }")  {{ panel.icon }}
        v-list-tile-content
          v-list-tile-title(:class="{'blue--text': panel.name==selectedDashboardPanel,'text--lighten-1':panel.name==selectedDashboardPanel }")  {{ panel.title }}


    v-list(dense v-if="editorIsVisible")
      v-subheader.mt-3.grey--text.text--darken-1 EDITOR 
      v-list-tile(key='-1' @click='onSelectContainer({id:-1,name:"back"})' v-if="selectedEditorContainer && selectedEditorContainer.id!=0")
        v-list-tile-action.panel-icon
          v-icon folder
        v-list-tile-content
          v-list-tile-title ..    
      v-list-tile(key='-2' @click='' v-if="selectedEditorContainer")
        v-list-tile-action.panel-icon.pl-2
          v-icon.blue--text.text--lighten-1 folder_open
        v-list-tile-content.pl-2
          v-list-tile-title.blue--text.text--lighten-1 {{selectedEditorContainer.name}}       
      v-list-tile(v-for='container in editorContainers' :key='container.id' @click='onSelectContainer({id:container.id,name:container.name})')
        v-list-tile-action.panel-icon.pl-4
          v-icon folder
        v-list-tile-content.pl-2
          v-list-tile-title {{ container.name }}

</template>


<script>
export default {
  props: [
    "dashboardPanels",
    "selectedDashboardPanel",
    "dashboardIsVisible",
    "editorIsVisible",
    "sidebarIsVisible",
    "editorContainers",
    "selectedEditorContainer"
  ],
  data: () => ({
    // dashboardPanels: [
    //   { icon: "subscriptions", title: "Dashboard",name:"Dashboard" },
    //   { icon: "trending_up", title: "Editor",name:"Editor" }
    // ]
  }),
  methods: {
    onSelectPanel(name) {
      this.$emit("selectPanel", name);
    },
    onSelectContainer(cont) {
      this.$emit("selectContainer", cont);
    }
  }
};
</script>


<style>
.panel-icon {
  min-width: 28px;
}
</style>