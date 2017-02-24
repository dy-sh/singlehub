/**
 * Created by Derwish (derwish.pro@gmail.com) on 11.02.17.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nodes_1 = require("../nodes");
var node_1 = require("../node");
var utils_1 = require("../utils");
//console logger back and front
var log;
if (typeof (window) === 'undefined')
    log = require('logplease').create('node', { color: 5 });
else
    log = Logger.create('node', { color: 5 });
//Watch a value in the editor
var WatchNode = (function (_super) {
    __extends(WatchNode, _super);
    function WatchNode() {
        _super.call(this);
        this.dataUpdated = false;
        this.onInputUpdated = function () {
            this.lastData = this.getInputData(0);
            this.dataUpdated = true;
            this.isRecentlyActive = true;
        };
        this.onGetMessageFromBackSide = function (data) {
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
    WatchNode.prototype.startSending = function () {
        var that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToFrontSide({ value: that.lastData });
            }
        }, this.UPDATE_INTERVAL);
    };
    WatchNode.prototype.showValueOnInput = function (value) {
        //show the current value
        var val = utils_1.default.formatAndTrimValue(value);
        this.inputs[0].label = val;
        this.setDirtyCanvas(true, false);
    };
    WatchNode.prototype.updateInputsLabels = function () {
        this.showValueOnInput(this.lastData);
    };
    return WatchNode;
}(node_1.Node));
exports.WatchNode = WatchNode;
nodes_1.Nodes.registerNodeType("debug/watch", WatchNode);
//Show value inside the debug console
var ConsoleNode = (function (_super) {
    __extends(ConsoleNode, _super);
    function ConsoleNode() {
        _super.call(this);
        this.MAX_MESS_PER_SEC = 10;
        this.messagesPerSec = 0;
        this.onInputUpdated = function () {
            var val = this.getInputData(0);
            this.isRecentlyActive = true;
            this.messagesPerSec++;
            if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {
                log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
                this.sendMessageToFrontSide({ value: val });
            }
        };
        this.onGetMessageFromBackSide = function (data) {
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
    ConsoleNode.prototype.updateMessPerSec = function () {
        var that = this;
        setInterval(function () {
            if (that.messagesPerSec > that.MAX_MESS_PER_SEC) {
                var dropped = that.messagesPerSec - that.MAX_MESS_PER_SEC;
                log.info("CONSOLE NODE [" + that.container.id + "/" + that.id + "]: dropped " + dropped + " messages due to too many");
                that.sendMessageToFrontSide({ dropped: dropped });
            }
            that.messagesPerSec = 0;
        }, 1000);
    };
    return ConsoleNode;
}(node_1.Node));
exports.ConsoleNode = ConsoleNode;
nodes_1.Nodes.registerNodeType("debug/console", ConsoleNode);
