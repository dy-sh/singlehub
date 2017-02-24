/**
 * Created by Derwish (derwish.pro@gmail.com) on 11.02.17.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../nodes", "../node", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../nodes");
    const node_1 = require("../node");
    const utils_1 = require("../utils");
    //console logger back and front
    let log;
    if (typeof (window) === 'undefined')
        log = require('logplease').create('node', { color: 5 });
    else
        log = Logger.create('node', { color: 5 });
    //Watch a value in the editor
    class WatchNode extends node_1.Node {
        constructor() {
            super();
            this.dataUpdated = false;
            this.onInputUpdated = function () {
                this.lastData = this.getInputData(0);
                this.dataUpdated = true;
                this.isRecentlyActive = true;
            };
            this.onGetMessageToFrontSide = function (data) {
                this.lastData = data.value;
                this.showValueOnInput(data.value);
            };
            this.UPDATE_INTERVAL = 300;
            this.title = "Watch";
            this.descriprion = "Show value of input";
            this.size = [60, 20];
            this.addInput("", null, { label: "" });
            this.startSending();
        }
        startSending() {
            let that = this;
            setInterval(function () {
                if (that.dataUpdated) {
                    that.dataUpdated = false;
                    that.sendMessageToFrontSide({ value: that.lastData });
                }
            }, this.UPDATE_INTERVAL);
        }
        showValueOnInput(value) {
            //show the current value
            let val = utils_1.default.formatAndTrimValue(value);
            this.inputs[0].label = val;
            this.setDirtyCanvas(true, false);
        }
        updateInputsLabels() {
            this.showValueOnInput(this.lastData);
        }
    }
    exports.WatchNode = WatchNode;
    nodes_1.Nodes.registerNodeType("debug/watch", WatchNode);
    //Show value inside the debug console
    class ConsoleNode extends node_1.Node {
        constructor() {
            super();
            this.MAX_MESS_PER_SEC = 10;
            this.messagesPerSec = 0;
            this.onInputUpdated = function () {
                let val = this.getInputData(0);
                this.isRecentlyActive = true;
                this.messagesPerSec++;
                if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {
                    log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
                    this.sendMessageToFrontSide({ value: val });
                }
            };
            this.onGetMessageToFrontSide = function (data) {
                if (data.value)
                    log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + data.value);
                if (data.dropped)
                    log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: dropped " + data.dropped + " messages due to too many");
            };
            this.title = "Console";
            this.descriprion = "Show value inside the console";
            this.size = [60, 20];
            this.addInput("input");
            this.messagesPerSec = 0;
            this.updateMessPerSec();
        }
        updateMessPerSec() {
            let that = this;
            setInterval(function () {
                if (that.messagesPerSec > that.MAX_MESS_PER_SEC) {
                    let dropped = that.messagesPerSec - that.MAX_MESS_PER_SEC;
                    log.info("CONSOLE NODE [" + that.container.id + "/" + that.id + "]: dropped " + dropped + " messages due to too many");
                    that.sendMessageToFrontSide({ dropped: dropped });
                }
                that.messagesPerSec = 0;
            }, 1000);
        }
    }
    exports.ConsoleNode = ConsoleNode;
    nodes_1.Nodes.registerNodeType("debug/console", ConsoleNode);
});
//# sourceMappingURL=debug.js.map