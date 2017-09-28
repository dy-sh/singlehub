<template lang='pug'>
div
  v-navigation-drawer(permanent clipped app width=200)
    //- v-navigation-drawer(v-else persistent clipped enable-resize-watcher v-model='drawer' app width=200)
    v-list(dense)
      v-subheader.mt-3.grey--text.text--darken-1 DASHBOARD
      v-list-tile(v-for='panel in panels' :key='panel.name' @click='onClick(panel.name)')
        v-list-tile-action
          v-icon(:class="{'blue--text': panel.name==selected,'text--lighten-1':panel.name==selected }")  {{ panel.icon }}
        v-list-tile-content
          v-list-tile-title(:class="{'blue--text': panel.name==selected,'text--lighten-1':panel.name==selected }")  {{ panel.title }}

  v-toolbar(dense fixed clipped-left app)
    v-toolbar-side-icon(@click.stop='drawer = !drawer')
    v-toolbar-title(v-text='title')

</template>


<script>
export default {
  props: ["panels", "selected"],
  data: () => ({
    drawer: true,
    title: "SingleHub"
    // panels: [
    //   { icon: "subscriptions", title: "Dashboard",name:"Dashboard" },
    //   { icon: "trending_up", title: "Editor",name:"Editor" }
    // ]
  }),
  methods: {
    onClick(name) {
      this.$emit("click", name);
    }
  }
};
</script>


<style>

</style>