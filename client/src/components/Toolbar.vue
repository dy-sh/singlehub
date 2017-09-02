<template lang='pug'>
  div
    v-navigation-drawer(persistent='', v-model='drawer', enable-resize-watcher='', app='' clipped)
      v-list
        v-list-tile(v-for='(item, i) in items', :key='i', value='true')
          v-list-tile-action
            v-icon(light='', v-html='item.icon')
          v-list-tile-content
            v-list-tile-title(v-text='item.title')
    v-toolbar(app='', clipped-left dense fixed)
      v-toolbar-side-icon(@click.stop='drawer = !drawer')
      v-toolbar-title(v-text='title')
      v-spacer
      v-btn(icon='', @click.stop='rightDrawer = !rightDrawer')
        v-icon menu
</template>


<script>
export default {
  data() {
    return {
      drawer: true,
      items: [{ icon: "bubble_chart", title: "Welcome" }],
      title: "SingleHub"
    };
  }
};
</script>


<style>

</style>