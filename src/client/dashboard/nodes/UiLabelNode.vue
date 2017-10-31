<template lang='pug'>
  v-list(dense)
    v-list-tile(v-if="stateReceived")
      v-list-tile-content
        v-list-tile-title {{uiElement.title}}
        v-list-tile-sub-title {{uiElement.subtitle}}
      v-spacer
      v-chip(label outline color="blue") {{state}}   

  //- v-container(v-if="stateReceived" grid-list-xs)
  //-   v-layout(row wrap)
  //-     v-flex
  //-       div.pt-3.pl-2 {{uiElement.title}}
  //-     v-flex(text-xs-right)
  //-       div.pr-1
</template>








<script>
import getNodeStateMixin from "./mixins/getNodeState";

export default {
  mixins: [getNodeStateMixin],
  props: ["uiElement"],
  data() {
    return {
      state: null,
      stateReceived: false
    };
  }
};
</script>
