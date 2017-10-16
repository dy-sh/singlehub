<template lang='pug'>
 v-toolbar(dense fixed clipped-left app)
    v-toolbar-side-icon(@click.stop='onClickSidebar')
    v-toolbar-title(v-text='title')
    v-spacer
    v-btn(
      flat 
      @click='onClickDashboard' 
      :class="{'blue--text': dashboardIsVisible,'text--lighten-1':dashboardIsVisible }") DASHBOARD
    v-btn(
      flat 
      @click='onClickEditor' 
      :class="{'blue--text': editorIsVisible,'text--lighten-1':editorIsVisible }") EDITOR
</template>


<script>
export default {
  props: ["dashboardIsVisible", "editorIsVisible"],
  data: () => ({
    title: "SingleHub"
  }),
  methods: {
    onClickSidebar(name) {
      this.$emit("clickSidebar", name);
    },
    onClickDashboard() {
      this.$emit("clickDashboard");
    },
    onClickEditor() {
      this.$emit("clickEditor");
    }
  }
};
</script>


<style>
.panel-icon {
  min-width: 30px;
}
</style>