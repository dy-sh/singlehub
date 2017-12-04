<template lang='pug'>
  div
    v-list(dense)
      v-list-tile
        v-list-tile-content
          v-list-tile-title {{uiElement.title}}
          v-list-tile-sub-title {{uiElement.subtitle}}
        v-spacer
        v-list-tile-action
          div
            v-btn.chart-btn(small outline flat color="grey darken-2" @click="onClearClick") 
              small CLEAR
            v-btn.chart-btn(small outline flat color="grey darken-2" @click="onStyleClick") 
              small STYLE
            v-btn.chart-btn(small outline flat color="grey darken-2" @click="onAllClick") 
              small ALL
            v-btn.chart-btn(small outline flat color="grey darken-2" @click="onNowClick") 
              small NOW
    div.parrent(v-if="showChart")
      chart(:items="items" :options="options")
</template>



<script>
import onNodeMessageMixin from "./mixins/onNodeMessage";
import sendMessageToNodeMixin from "./mixins/sendMessageToNode";
import moment from "moment";
import { Graph2d } from "vue2vis";

export default {
  mixins: [onNodeMessageMixin, sendMessageToNodeMixin],
  props: ["uiElement"],
  components: {
    chart: Graph2d
  },
  data() {
    return {
      showChart: true,
      items: [
        { x: "2017-12-11", y: 10 },
        { x: "2017-12-12", y: 25 },
        { x: "2017-12-13", y: 30 },
        { x: "2017-12-14", y: 10 },
        { x: "2017-12-15", y: 15 },
        { x: "2017-12-16", y: 30 }
      ],
      options: {
        //  start: '2017-12-10',
        // end: '2017-12-18'
        height: "190px",
        style: "bar",
        drawPoints: false,
        barChart: { width: 50, align: "right", sideBySide: false }
      }
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
      this.sendMessageToNode("clear");
    },
    onStyleClick() {},
    onAllClick() {},
    onNowClick() {}
  },
  mounted() {
    // this.sendMessageToNode("getLog");
    // setTimeout(() => {
    //   this.showChart = true;
    // }, 1000);
  }
};
</script>

<style scoped>
@import "~vis/dist/vis.css";

.chart-btn {
  min-width: 40px !important;
  width: 40px !important;
}
.parrent {
  padding: 0px 15px;
}
</style>