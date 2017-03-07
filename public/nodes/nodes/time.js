/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_1 = require("../node");
var container_1 = require("../container");
var TickerNode = (function (_super) {
    __extends(TickerNode, _super);
    function TickerNode() {
        _super.call(this);
        this.title = "Ticker";
        this.descriprion = "This node generates a sequence like 101010 (true|false)... with specified time interval. <br/>" +
            "You can set the time interval and activate the timer, " +
            "giving \"true\" to the input named \"Enable\". <br/>" +
            "If \"Generate False\" option is enabled in the settings of the node, " +
            "node will generate a sequence like 101010... " +
            "If disabled, the output will be 111111...";
        this.addInput("interval", "number");
        this.addInput("enable", "boolean");
        this.addOutput("tick", "boolean");
        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };
        this.settings["false"] = { description: "Generate False", value: true, type: "boolean" };
    }
    TickerNode.prototype.onExecute = function () {
        var enable = this.getInputData(1);
        if (enable == false)
            return;
        var now = Date.now();
        if (!this.lastTime)
            this.lastTime = now;
        var interval = this.getInputData(0);
        if (interval == null)
            interval = this.settings["interval"].value;
        var val = this.outputs[0].data;
        if (this.settings["false"].value) {
            if (val && now - this.lastTime >= interval / 2) {
                this.setOutputData(0, false);
                return;
            }
        }
        if (now - this.lastTime >= interval) {
            this.lastTime = now;
            this.setOutputData(0, true);
            return;
        }
    };
    return TickerNode;
}(node_1.Node));
exports.TickerNode = TickerNode;
container_1.Container.registerNodeType("time/ticker", TickerNode);
var DelayNode = (function (_super) {
    __extends(DelayNode, _super);
    function DelayNode() {
        _super.call(this);
        this.delayedValues = [];
        this.title = "Delay";
        this.descriprion = "This node introduces a delay in the flow of events. <br/>" +
            "All incoming values (including null) " +
            "will be sent to the output after a specified time interval.";
        this.addInput("value");
        this.addInput("interval", "boolean");
        this.addOutput("value");
        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };
    }
    DelayNode.prototype.onInputUpdated = function () {
        if (this.inputs[0].updated)
            this.delayedValues.push({
                val: this.inputs[0].data,
                time: Date.now()
            });
    };
    DelayNode.prototype.onExecute = function () {
        if (this.delayedValues.length == 0)
            return;
        var interval = this.getInputData(1);
        if (interval == null)
            interval = this.settings["interval"].value;
        var val = this.delayedValues[0];
        if (Date.now() - val.time >= interval) {
            this.delayedValues.shift();
            this.setOutputData(0, val.val);
            return;
        }
    };
    return DelayNode;
}(node_1.Node));
exports.DelayNode = DelayNode;
container_1.Container.registerNodeType("time/delay", DelayNode);
var DelayMeterNode = (function (_super) {
    __extends(DelayMeterNode, _super);
    function DelayMeterNode() {
        _super.call(this);
        this.title = "Delay meter";
        this.descriprion = "This node measures the delay between the incoming events. <br/>" +
            "Any value sent to the input (excluding null) will be accepted.";
        this.addInput("value");
        this.addInput("reset", "boolean");
        this.addOutput("ms", "number");
    }
    DelayMeterNode.prototype.onInputUpdated = function () {
        if (this.inputs[1].updated && this.inputs[1].data == true) {
            this.lastTime = null;
            this.setOutputData(0, null);
        }
        if (this.inputs[0].updated && this.inputs[0].data != null) {
            if (this.lastTime != null) {
                var delay = Date.now() - this.lastTime;
                this.setOutputData(0, delay);
            }
            this.lastTime = Date.now();
        }
    };
    return DelayMeterNode;
}(node_1.Node));
exports.DelayMeterNode = DelayMeterNode;
container_1.Container.registerNodeType("time/delay-meter", DelayMeterNode);
