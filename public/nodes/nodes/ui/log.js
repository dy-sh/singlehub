/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("../../container");
var ui_node_1 = require("./ui-node");
var template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <button type="button" class="ui right floated tiny button" id="clear-log-{{id}}">Clear</button>\
        <br />\
        <div class="ui segment" style="overflow-y: scroll; height: 150px;" id="log-{{id}}"></div>\
    </div>';
var UiLogNode = (function (_super) {
    __extends(UiLogNode, _super);
    function UiLogNode() {
        _super.call(this, "Log", template);
        this.MAX_MESS_PER_SEC = 11;
        this.messagesPerSec = 0;
        this.descriprion = "";
        this.properties['log'] = [];
        this.settings['maxRecords'] = { description: "Max Records", type: "number", value: 10 };
        this.settings['saveToDb'] = { description: "Save log to DB", type: "boolean", value: false };
        this.addInput("input");
    }
    UiLogNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.dashboard) {
            var that_1 = this;
            $('#clear-log-' + that_1.id).click(function () {
                that_1.sendMessageToServerSide('clear');
            });
            if (this.properties['log'].length > 0) {
                var log = $('#log-' + this.id);
                for (var _i = 0, _a = this.properties['log']; _i < _a.length; _i++) {
                    var record = _a[_i];
                    log.append('<div class="log-record">' +
                        moment(record.date).format("DD.MM.YYYY H:mm:ss.SSS")
                        + ': ' + record.value + '<br>'
                        + '</div>');
                }
            }
        }
        if (this.side == container_1.Side.server)
            this.updateMessPerSec();
    };
    UiLogNode.prototype.updateMessPerSec = function () {
        var that = this;
        setInterval(function () {
            if (that.messagesPerSec > that.MAX_MESS_PER_SEC) {
                var dropped = that.messagesPerSec - that.MAX_MESS_PER_SEC;
                var record = { date: Date.now(), value: "Dropped " + dropped + " messages (data rate limitation)" };
                that.properties['log'].push(record);
                that.sendMessageToDashboardSide({ record: record });
            }
            that.messagesPerSec = 0;
        }, 1000);
    };
    UiLogNode.prototype.onInputUpdated = function () {
        if (!this.inputs[0].link)
            return;
        var val = this.getInputData(0);
        this.isRecentlyActive = true;
        this.messagesPerSec++;
        if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {
            var records = this.properties['log'];
            var record = { date: Date.now(), value: val };
            records.push(record);
            var max = this.settings['maxRecords'].value;
            var unwanted = records.length - max;
            records.splice(0, unwanted);
            this.sendMessageToDashboardSide({ record: record });
            //update in db
            if (this.container.db && this.settings['saveToDb'].value) {
                this.container.db.updateNode(this.id, this.container.id, { $push: { "properties.log": { $each: [record], $slice: -max } } });
            }
        }
    };
    ;
    UiLogNode.prototype.onGetMessageToServerSide = function (data) {
        //clear log
        this.isRecentlyActive = true;
        this.properties['log'] = [];
        this.sendMessageToDashboardSide({ clear: true });
        //update in db
        if (this.container.db && this.settings['saveToDb'].value) {
            this.container.db.updateNode(this.id, this.container.id, { $unset: { "properties.log": true } });
        }
    };
    ;
    UiLogNode.prototype.onGetMessageToDashboardSide = function (data) {
        if (data.clear)
            $('#log-' + this.id).html("");
        if (data.record)
            this.addLogRecord(data.record);
    };
    ;
    UiLogNode.prototype.addLogRecord = function (record) {
        var log = $('#log-' + this.id);
        log.append('<div class="log-record">' +
            moment(record.date).format("DD.MM.YYYY H:mm:ss.SSS")
            + ': ' + record.value + '<br>'
            + '</div>');
        var records = log.children();
        var max = this.settings['maxRecords'].value;
        var unwanted = records.length - max;
        for (var i = 0; i < unwanted; i++) {
            records[i].remove();
        }
        if (log.get(0) != null)
            log.animate({ scrollTop: $('#log-' + this.id).get(0).scrollHeight }, 0);
    };
    return UiLogNode;
}(ui_node_1.UiNode));
exports.UiLogNode = UiLogNode;
container_1.Container.registerNodeType("ui/log", UiLogNode);
