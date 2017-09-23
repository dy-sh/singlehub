<template lang='pug'>
div
  v-navigation-drawer(persistent='', clipped='', enable-resize-watcher='', v-model='drawer', app='')
    v-list(dense='')
      v-list-tile(v-for='item in items', :key='item.text', @click='')
        v-list-tile-action
          v-icon {{ item.icon }}
        v-list-tile-content
          v-list-tile-title
            | {{ item.text }}
      v-subheader.mt-3.grey--text.text--darken-1 SETTINGS
      //- v-list
      //-   v-list-tile(v-for='item in items2', :key='item.text', avatar='', @click='')
      //-     v-list-tile-title(v-text='item.text')
      v-list-tile.mt-3(@click='')
        v-list-tile-action
          v-icon(color='grey darken-1') add_circle_outline
        v-list-tile-title.grey--text.text--darken-1 Hardware
      v-list-tile(@click='')
        v-list-tile-action
          v-icon(color='grey darken-1') settings
        v-list-tile-title.grey--text.text--darken-1 Settings
  v-toolbar(dense fixed clipped-left app)
    v-toolbar-side-icon(@click.stop='drawer = !drawer')
    v-toolbar-title(v-text='title')
    //- v-spacer
    //- v-btn(icon @click.stop='rightDrawer = !rightDrawer')
    //-   v-icon view_module
</template>


<script>
export default {
  data: () => ({
    drawer: true,
    title: "SingleHub",
    items: [
      { icon: "subscriptions", text: "Dashboard" },
      { icon: "trending_up", text: "Editor" }
      // { icon: "history", text: "History" },
      // { icon: "featured_play_list", text: "Playlists" },
      // { icon: "watch_later", text: "Watch Later" }
    ]
    // items2: [{ picture: 28, text: "Joseph" }, { picture: 38, text: "Apple" }]
  })
};
</script>


<style>

</style>