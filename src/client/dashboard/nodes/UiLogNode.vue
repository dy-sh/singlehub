<template lang='pug'>
  div
    v-list(dense)
      v-list-tile
        v-list-tile-content
          v-list-tile-title {{uiElement.title}}
          v-list-tile-sub-title {{uiElement.subtitle}}
        v-spacer
        v-list-tile-action
          v-btn(small flat color="grey darken-2" @click="onClearClick") CLEAR

    div.log(style="height: 150px;" v-bar="{preventParentScroll: true}")
      div
        ul
          li(v-for="rec in log") 
            span.date
              small {{ rec.date | moment("DD.MM.YYYY H:mm:ss.SSS") }}: 
            span.value {{rec.value}}
    //- v-btn(small color="primary" @click="onClearClick") CLEAR
</template>



<script>
import onNodeMessageMixin from "./mixins/onNodeMessage";
import sendMessageToNodeMixin from "./mixins/sendMessageToNode";
import moment from "moment";

export default {
  mixins: [onNodeMessageMixin, sendMessageToNodeMixin],
  props: ["uiElement"],
  data() {
    return {
      log: [],
      maxRecords: 10
    };
  },
  methods: {
    onNodeMessage(data) {
      if (data.log != undefined) this.log = data.log;

      if (data.maxRecords != undefined) {
        this.maxRecords = data.maxRecords;
        this.log.splice(0, this.log.length - this.maxRecords);
      }

      if (data.record != undefined) {
        this.log.unshift(data.record);
        let del = this.log.length - this.maxRecords;
        this.log.splice(this.log.length - del, del);
      }
    },
    onClearClick() {
      this.sendMessageToNode("clearLog");
    }
  },
  mounted() {
    this.sendMessageToNode("getLog");
  }
};
</script>

<style>
.log {
  margin: 0px 5px;
}
.date {
  color: #666;
}
.value {
  color: #bbb;
}
</style>