<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title My Device
              v-spacer
              v-toolbar-side-icon
            v-divider
            v-list(subheader)
              v-subheader Living room
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Ligth
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-switch(v-model="sw1" value="John")
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Curtains
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-btn(color='blue darken-2', @click='') ON   
            v-divider
            v-list(subheader)
              v-subheader Kitchen
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Door
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-switch(v-model="sw1" value="John")
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Window
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-btn(color='blue darken-2', @click='') ON  

</template>


<script>
export default {
  data: () => ({
    sw1: true
  })
};
</script>

