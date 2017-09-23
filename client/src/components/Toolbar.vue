<template lang='pug'>
div
  v-navigation-drawer(persistent='', clipped='', enable-resize-watcher='', v-model='drawer', app='')
    v-list(dense='')
      v-subheader.mt-3.grey--text.text--darken-1 DASHBOARD
      v-list-tile(v-for='panel in panels', :key='panel.name', @click='')
        v-list-tile-action
          v-icon {{ panel.icon }}
        v-list-tile-content
          v-list-tile-title
            | {{ panel.title }}

  v-toolbar(dense fixed clipped-left app)
    v-toolbar-side-icon(@click.stop='drawer = !drawer')
    v-toolbar-title(v-text='title')

</template>


<script>
export default {
  props: ["panels"],
  data: () => ({
    drawer: true,
    title: "SingleHub"
    // panels: [
    //   { icon: "subscriptions", title: "Dashboard",name:"Dashboard" },
    //   { icon: "trending_up", title: "Editor",name:"Editor" }
    // ]
  })
};
</script>


<style>

</style>