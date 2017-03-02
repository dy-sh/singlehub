/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <button type="button" class="ui right floated tiny button" id="clear-log-{{id}}">Clear</button>\
        <br />\
        <div class="ui segment" style="overflow-y: scroll; height: 150px;" id="log-{{id}}"></div>\
    </div>';
    class UiLogNode extends ui_node_1.UiNode {
        constructor() {
            super("Log", template);
            this.MAX_MESS_PER_SEC = 11;
            this.messagesPerSec = 0;
            this.descriprion = "";
            this.properties['log'] = [];
            this.settings['maxRecords'] = { description: "Max Records", type: "number", value: 10 };
            this.addInput("input");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.dashboard) {
                let that = this;
                $('#clear-log-' + that.id).click(function () {
                    that.sendMessageToServerSide('clear');
                });
            }
            if (this.side == container_1.Side.server)
                this.updateMessPerSec();
        }
        updateMessPerSec() {
            let that = this;
            setInterval(function () {
                if (that.messagesPerSec > that.MAX_MESS_PER_SEC) {
                    let dropped = that.messagesPerSec - that.MAX_MESS_PER_SEC;
                    let record = { date: Date.now(), value: "Dropped " + dropped + " messages (data rate limitation)" };
                    that.properties['log'].push(record);
                    that.sendMessageToDashboardSide({ record: record });
                }
                console.log(that.messagesPerSec);
                that.messagesPerSec = 0;
            }, 1000);
        }
        onInputUpdated() {
            let val = this.getInputData(0);
            this.isRecentlyActive = true;
            this.messagesPerSec++;
            if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {
                let record = { date: Date.now(), value: val };
                this.properties['log'].push(record);
                this.sendMessageToDashboardSide({ record: record });
                console.log("send");
            }
        }
        ;
        onGetMessageToServerSide(data) {
            this.isRecentlyActive = true;
            this.properties['log'] = [];
            this.sendMessageToDashboardSide({ clear: true });
        }
        ;
        onGetMessageToDashboardSide(data) {
            if (data.clear)
                $('#log-' + this.id).html("");
            if (data.record)
                this.addLogRecord(data.record);
        }
        ;
        addLogRecord(record) {
            $('#log-' + this.id).append('<div class="log-record">'
                + moment(record.date).format("DD.MM.YYYY H:mm:ss.SSS")
                + ': ' + record.value + '<br>'
                + '</div>');
            let records = $('#log-' + this.id).children();
            let max = this.settings['maxRecords'].value;
            let unwanted = records.length - max;
            for (let i = 0; i < unwanted; i++) {
                records[i].remove();
            }
            // if ($('#log-' + this.id).get(0) != null)
            $('#log-' + this.id).animate({ scrollTop: $('#log-' + this.id).get(0).scrollHeight }, 0);
        }
    }
    exports.UiLogNode = UiLogNode;
    container_1.Container.registerNodeType("ui/log", UiLogNode);
});
//# sourceMappingURL=log.js.map