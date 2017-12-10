<template lang='pug'>
  div(ref="visualization") 
</template>


<script>
import vis from "vis";

const events = [
  "click",
  "contextmenu",
  "doubleClick",
  "changed",
  "rangechange",
  "rangechanged",
  "timechange",
  "timechanged"
];

export default {
  name: "graph2d",
  props: {
    groups: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object
    }
  },
  data: () => ({
    graph2d: null,
    zoomTimer: null,
    autoscroll: "continuous"
  }),
  watch: {
    items: {
      deep: true,
      handler(n) {
        this.graph2d.setItems(new vis.DataSet(n));
      }
    },
    groups: {
      deep: true,
      handler(v) {
        this.graph2d.setGroups(new vis.DataSet(v));
      }
    },
    options: {
      deep: true,
      handler(v) {
        this.graph2d.setOptions(v);
      }
    }
  },
  methods: {
    destroy() {
      this.graph2d.destroy();
    },
    fit() {
      this.graph2d.fit();
    },
    getCurrentTime() {
      return this.graph2d.getCurrentTime();
    },
    getCustomTime() {
      return this.graph2d.getCustomTime(id);
    },
    getDataRange() {
      return this.graph2d.getDataRange();
    },
    getEventProperties(event) {
      return this.graph2d.getEventProperties(event);
    },
    getLegend(groupId, iconWidth, iconHeight) {
      return this.graph2d.getLegend(groupId, iconWidth, iconHeight);
    },
    isGroupVisible(groupId) {
      return this.graph2d.isGroupVisible(groupId);
    },
    moveTo(time, options) {
      this.graph2d.moveTo(time, options);
    },
    on(event, callback) {
      this.graph2d.moveTo(event, callback);
    },
    off(event, callback) {
      this.graph2d.moveTo(event, callback);
    },
    redraw() {
      this.graph2d.redraw();
    },
    setCurrentTime(time) {
      this.graph2d.setCurrentTime(time);
    },
    setCustomTime(time) {
      this.graph2d.setCustomTime(time);
    },
    setGroups(groups) {
      this.graph2d.setGroups(groups);
    },
    setItems(items) {
      this.graph2d.setItems(items);
    },
    setOptions(options) {
      this.graph2d.setOptions(options);
    },
    setWindow(start, end) {
      this.graph2d.setWindow(start, end);
    },

    renderStep() {
      // move the window (you can think of different strategies).
      let now = vis.moment();
      let range = this.graph2d.getWindow();
      let interval = range.end - range.start;
      let that = this;
      switch (this.autoscroll) {
        case "continuous":
          // continuously move the window
          this.graph2d.setWindow(now - interval, now, { animation: false });
          requestAnimationFrame(that.renderStep.bind(that));
          break;

        case "discrete":
          this.graph2d.setWindow(now - interval, now, { animation: false });
          setTimeout(that.renderStep.bind(that), 1000);
          break;

        case "none": // 'static'
          // move the window 90% to the left when now is larger than the end of the window
          // if (now > range.end) {
          //     this.graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
          // }
          setTimeout(that.renderStep.bind(that), 1000);
          break;
      }
    },

    showNow() {
      clearTimeout(this.zoomTimer);
      this.autoscroll = "none";
      let window = {
        start: vis.moment().add(-30, "seconds"),
        end: vis.moment()
      };
      this.graph2d.setWindow(window);
      //timer needed for prevent zoomin freeze bug
      this.zoomTimer = setTimeout(() => {
        this.autoscroll = "continuous";
      }, 1000);
    },

    showAll() {
      clearTimeout(this.zoomTimer);
      this.autoscroll = "none";
      //   graph2d.fit();

      let start, end;

      if (this.dataset.length == 0) {
        start = vis.moment().add(-1, "seconds");
        end = vis.moment().add(60, "seconds");
      } else {
        let min = this.dataset.min("x");
        let max = this.dataset.max("x");
        start = vis.moment(min.x).add(-1, "seconds");
        end = vis.moment(max.x).add(60, "seconds");
      }

      let window = {
        start: start,
        end: end
      };
      this.graph2d.setWindow(window);
    }
  },
  mounted() {
    const container = this.$refs.visualization;
    const items = new vis.DataSet(this.items);
    const groups = new vis.DataSet(this.groups);
    this.graph2d = new vis.Graph2d(container, items, groups, this.options);
    // events.forEach(eventName =>
    //   this.graph2d.on(eventName, props => this.$emit(eventName, props))
    // );
    // if (this.withTimeTick) {
    //   this.timeline.on("currentTimeTick", props =>
    //     this.$emit("currentTimeTick", props)
    //   );
    // }

    this.showNow();
    this.renderStep();
  },
  beforeDestroy() {
    events.forEach(eventName =>
      this.graph2d.off(eventName, props => this.$emit(eventName, props))
    );
    if (this.withTimeTick) {
      this.timeline.off("currentTimeTick", props =>
        this.$emit("currentTimeTick", props)
      );
    }
  }
};
</script>