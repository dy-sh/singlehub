<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md8 offset-xs0 offset-sm1 offset-md2)
          //- v-card(dark color='green')
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title Welcome to SingleHub
              v-spacer
              v-btn(dark icon)
                v-icon view_module
            v-card-text
              //- h5.text-xs-center Welcome to SingleHub
              p This is the initial setup wizard.
              p You will be offered the following steps:
                ul
                  li Configure database
                  li Create Admin profile
            .text-xs-center.pb-3    
              v-btn(color='blue darken-2', @click='onNext') Well, let's start
</template>


<script>
export default {
  data() {
    return {};
  },
  methods: {
    onNext() {
      this.$router.push({ name: "init/db" });
    }
  }
};
</script>


