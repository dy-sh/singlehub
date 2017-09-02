<template lang='pug'>
  div
    v-navigation-drawer(persistent='', :mini-variant='miniVariant', :clipped='clipped', v-model='drawer', enable-resize-watcher='', app='')
      v-list
        v-list-tile(v-for='(item, i) in items', :key='i', value='true')
          v-list-tile-action
            v-icon(light='', v-html='item.icon')
          v-list-tile-content
            v-list-tile-title(v-text='item.title')
    v-toolbar(fixed='', app='', :clipped-left='clipped' dense)
      v-toolbar-side-icon(@click.stop='drawer = !drawer')
      v-btn(icon='', @click.stop='miniVariant = !miniVariant')
        v-icon(v-html="miniVariant ? 'chevron_right' : 'chevron_left'")
      v-btn(icon='', @click.stop='clipped = !clipped')
        v-icon web
      v-btn(icon='', @click.stop='fixed = !fixed')
        v-icon remove
      v-toolbar-title(v-text='title')
      v-spacer
      v-btn(icon='', @click.stop='rightDrawer = !rightDrawer')
        v-icon menu
</template>


<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [{ icon: "bubble_chart", title: "Inspire" }],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Vuetify.js"
    };
  }
};
</script>


<style>

</style>