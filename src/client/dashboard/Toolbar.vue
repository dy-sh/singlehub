<template lang='pug'>
div
  v-navigation-drawer(permanent clipped app width=170)
    //- v-navigation-drawer(v-else persistent clipped enable-resize-watcher v-model='drawer' app width=200)
    v-list(dense v-if="dashboardIsVisible")
      v-subheader.mt-3.grey--text.text--darken-1 DASHBOARD
      v-list-tile(v-for='panel in panels' :key='panel.name' @click='onClickSidebar(panel.name)')
        v-list-tile-action.panel-icon
          v-icon(:class="{'blue--text': panel.name==selected,'text--lighten-1':panel.name==selected }")  {{ panel.icon }}
        v-list-tile-content
          v-list-tile-title(:class="{'blue--text': panel.name==selected,'text--lighten-1':panel.name==selected }")  {{ panel.title }}

    v-list(dense v-if="editorIsVisible")
      v-subheader.mt-3.grey--text.text--darken-1 EDITOR


  v-toolbar(dense fixed clipped-left app)
    v-toolbar-side-icon(@click.stop='drawer = !drawer')
    v-toolbar-title(v-text='title')
    v-spacer
    v-btn(flat @click='onClickToolbarDashboard' :class="{'blue--text': dashboardIsVisible,'text--lighten-1':dashboardIsVisible }") DASHBOARD
    v-btn(flat @click='onClickToolbarEditor' :class="{'blue--text': editorIsVisible,'text--lighten-1':editorIsVisible }") EDITOR

</template>


<script>
export default {
  props: ["panels", "selected", "dashboardIsVisible", "editorIsVisible"],
  data: () => ({
    drawer: true,
    title: "SingleHub"
    // panels: [
    //   { icon: "subscriptions", title: "Dashboard",name:"Dashboard" },
    //   { icon: "trending_up", title: "Editor",name:"Editor" }
    // ]
  }),
  methods: {
    onClickSidebar(name) {
      this.$emit("clickSidebar", name);
    },
    onClickToolbarDashboard() {
      this.$emit("clickToolbarDashboard");
    },
    onClickToolbarEditor() {
      this.$emit("clickToolbarEditor");
    }
  }
};
</script>


<style>
.panel-icon {
  min-width: 30px;
}
</style>