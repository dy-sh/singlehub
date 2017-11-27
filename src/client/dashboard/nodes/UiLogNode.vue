<template lang='pug'>
  div
    v-text-field.log(name="input-1" :label="uiElement.title" textarea hide-details :value="logText")
    v-btn(small color="primary" @click="onClearClick") CLEAR
</template>



<script>
import onNodeMessageMixin from "./mixins/onNodeMessage";
import sendMessageToNodeMixin from "./mixins/sendMessageToNode";

export default {
  mixins: [onNodeMessageMixin, sendMessageToNodeMixin],
  props: ["uiElement"],
  data() {
    return {
      logText: ""
    };
  },
  methods: {
    onNodeMessage(data) {
      if (data.log != undefined) {
        this.logText = "";
        data.log.forEach(record => this.addLogRecord(record));
      }
      if (data.record != undefined) this.addLogRecord(data.record);
    },
    onClearClick() {
      this.sendMessageToNode("clearLog");
    },
    addLogRecord(record) {
      this.logText += record.date + ": " + record.value + "\n";
    }
  },
  mounted() {
    this.sendMessageToNode("getLog");
  }
};
</script>

<style>
.log {
  padding: 15px 5px 0px 5px;
}
</style>