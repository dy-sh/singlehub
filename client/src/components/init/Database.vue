<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md8 offset-xs0 offset-sm1 offset-md2)
          //- v-card(dark color='green')
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title Database setup
              v-spacer
              v-icon(medium) storage
              //- v-btn(dark icon)
            v-card-text
              p Select database. 
              v-layout(wrap)
                v-flex(sm6)
                  h6 External database
                    br
                    | (coming soon)
                  ul
                    li Requires configuration
                    li You can use separate server
                    li Works faster than the built-in database
                    li Gives a performance boost
                v-flex(sm6)
                  h6 Built-in database
                  ul
                    li Requires no configuration
                    li Stored as a file on the disk that can be easily copied or deleted
              p If you don't know what database to use, choose the built-in database.
              v-divider(dark)
              .text-xs-center  
                v-btn(color='blue darken-2' disabled) External 
                v-btn(color='blue darken-2', @click='onBuiltIn') Built-in
              v-divider(dark)
              .text-xs-center.pt-2
                a(href='#',  @click='onSkip') Skip this step. Don't use a database.

</template>


<script>
export default {
  data() {
    return {};
  },
  methods: {
    onBuiltIn() {
      this.$router.push({ name: "init/admin" });
    },
    onSkip() {
      this.$router.push({ name: "/" });
    }
  }
};
</script>


<style scoped>
a {
  color: gray;
}
</style>
