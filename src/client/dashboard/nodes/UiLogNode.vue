<template lang='pug'>
  div
    v-list(dense)
      v-list-tile
        v-list-tile-content
          v-list-tile-title {{uiElement.title}}
          v-list-tile-sub-title {{uiElement.subtitle}}
        v-spacer
        v-list-tile-action
          //- v-btn(small color="primary" @click="onClearClick") CLEAR

    div.log(v-chat-scroll="{always: false}" style="overflow-y: scroll; height: 150px;")
      ul(class="messages")
        li(class="message" v-for="rec in log") {{ rec.date | moment("DD.MM.YYYY H:mm:ss.SSS") }}: {{rec.value}}
    v-btn(small color="primary" @click="onClearClick") CLEAR
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
      log: []
    };
  },
  methods: {
    onNodeMessage(data) {
      if (data.log != undefined) this.log = data.log;
      if (data.record != undefined) this.log.push(data.record);
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
</style>