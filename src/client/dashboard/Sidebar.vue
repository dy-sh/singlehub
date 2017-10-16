<template lang='pug'>
  v-navigation-drawer(v-if="sidebarIsVisible" permanent clipped app width=170)
    //- v-navigation-drawer(persistent clipped enable-resize-watcher v-model='drawer' app width=200)
    v-list(dense v-if="dashboardIsVisible")
      v-subheader.mt-3.grey--text.text--darken-1 DASHBOARD
      v-list-tile(v-for='panel in panels' :key='panel.name' @click='onSelectPanel(panel.name)')
        v-list-tile-action.panel-icon
          v-icon(:class="{'blue--text': panel.name==selected,'text--lighten-1':panel.name==selected }")  {{ panel.icon }}
        v-list-tile-content
          v-list-tile-title(:class="{'blue--text': panel.name==selected,'text--lighten-1':panel.name==selected }")  {{ panel.title }}

    v-list(dense v-if="editorIsVisible")
      v-subheader.mt-3.grey--text.text--darken-1 EDITOR
</template>


<script>
export default {
  props: [
    "panels",
    "selected",
    "dashboardIsVisible",
    "editorIsVisible",
    "sidebarIsVisible"
  ],
  data: () => ({
    // panels: [
    //   { icon: "subscriptions", title: "Dashboard",name:"Dashboard" },
    //   { icon: "trending_up", title: "Editor",name:"Editor" }
    // ]
  }),
  methods: {
    onSelectPanel(name) {
      this.$emit("selectPanel", name);
    }
  }
};
</script>


<style>
.panel-icon {
  min-width: 30px;
}
</style>