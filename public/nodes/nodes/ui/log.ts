/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../node";
import Utils from "../../utils";
import {Side, Container} from "../../container";
import {UiNode} from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <button type="button" class="ui right floated tiny button" id="clear-log-{{id}}">Clear</button>\
        <br />\
        <div class="ui segment" style="overflow-y: scroll; height: 150px;" id="log-{{id}}"></div>\
    </div>';

declare let moment;

export class UiLogNode extends UiNode {
    MAX_MESS_PER_SEC = 11;
    messagesPerSec = 0;

    constructor() {
        super("Log", template);

        this.descriprion = "";
        this.properties['log'] = [];
        this.settings['maxRecords'] = {description: "Max Records", type: "number", value: 10};

        this.addInput("input");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.dashboard) {
            let that = this;
            $('#clear-log-' + that.id).click(function () {
                that.sendMessageToServerSide('clear');
            });

            if (this.properties['log'].length > 0) {
                let log = $('#log-' + this.id);
                for (let record of  this.properties['log']) {
                    log.append(
                        '<div class="log-record">' +
                        moment(record.date).format("DD.MM.YYYY H:mm:ss.SSS")
                        + ': ' + record.value + '<br>'
                        + '</div>'
                    );
                }
            }
        }

        if (this.side == Side.server)
            this.updateMessPerSec();
    }

    updateMessPerSec() {
        let that = this;
        setInterval(function () {
            if (that.messagesPerSec > that.MAX_MESS_PER_SEC) {
                let dropped = that.messagesPerSec - that.MAX_MESS_PER_SEC;
                let record = {date: Date.now(), value: "Dropped " + dropped + " messages (data rate limitation)"};
                that.properties['log'].push(record);
                that.sendMessageToDashboardSide({record: record});
            }

            that.messagesPerSec = 0;
        }, 1000);
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        this.isRecentlyActive = true;

        this.messagesPerSec++;
        if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {

            let records = this.properties['log'];
            let record = {date: Date.now(), value: val};
            records.push(record);

            let max = this.settings['maxRecords'].value;
            let unwanted = records.length - max;
            records.splice(0, unwanted);

            this.sendMessageToDashboardSide({record: record});
        }
    };

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        this.properties['log'] = [];
        this.sendMessageToDashboardSide({clear: true});
    };


    onGetMessageToDashboardSide(data) {
        if (data.clear)
            $('#log-' + this.id).html("");

        if (data.record)
            this.addLogRecord(data.record);
    };

    addLogRecord(record) {
        let log = $('#log-' + this.id);
        log.append(
            '<div class="log-record">' +
            moment(record.date).format("DD.MM.YYYY H:mm:ss.SSS")
            + ': ' + record.value + '<br>'
            + '</div>'
        );

        let records = log.children();
        let max = this.settings['maxRecords'].value;
        let unwanted = records.length - max;
        for (let i = 0; i < unwanted; i++) {
            records[i].remove();
        }

        if (log.get(0) != null)
            log.animate({scrollTop: $('#log-' + this.id).get(0).scrollHeight}, 0);
    }
}

Container.registerNodeType("ui/log", UiLogNode);

