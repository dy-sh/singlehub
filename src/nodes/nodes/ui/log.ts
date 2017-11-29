/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";


export class UiLogNode extends UiNode {
    MAX_MESS_PER_SEC = 11;
    messagesPerSec = 0;

    constructor() {
        super("Log", "UiLogNode");

        this.descriprion = "";
        this.properties['log'] = [];
        this.settings['maxRecords'] = { description: "Max Records", value: 10, type: "number" };
        this.settings['saveToDb'] = { description: "Save log to DB", value: false, type: "boolean" };

        this.addInput("input");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.updateMessPerSec();
    }

    onAfterSettingsChange(oldSettings) {
        if (this.side == Side.server) {
            if (oldSettings.maxRecords != this.settings.maxRecords) {
                this.removeOldRecords();

                this.sendMessageToDashboardSide({
                    // log: this.properties['log'],
                    maxRecords: this.settings['maxRecords'].value
                });
            }
        }
    }

    removeOldRecords() {
        let records = this.properties['log'];
        let max = this.settings['maxRecords'].value;
        records.splice(0, records.length - max);
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

            that.messagesPerSec = 0;
        }, 1000);
    }


    onInputUpdated() {
        if (!this.inputs[0].link)
            return;

        let val = this.getInputData(0);
        this.isRecentlyActive = true;

        this.messagesPerSec++;
        if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {

            let record = { date: Date.now(), value: val };
            this.properties['log'].push(record);

            this.removeOldRecords();

            this.sendMessageToDashboardSide({ record: record });

            //update in db
            let max = this.settings['maxRecords'].value;
            if (this.container.db && this.settings['saveToDb'].value) {
                this.container.db.updateNode(this.id, this.container.id,
                    { $push: { "properties.log": { $each: [record], $slice: -max } } });
            }
        }
    };


    onGetMessageToServerSide(message) {
        if (message == "getLog") {
            this.sendMessageToDashboardSide({
                log: this.properties['log'],
                maxRecords: this.settings['maxRecords'].value
            });
        }

        else if (message == "clearLog") {
            //clear log
            this.isRecentlyActive = true;
            this.properties['log'] = [];

            this.sendMessageToDashboardSide({ log: [] });

            //update in db
            if (this.container.db && this.settings['saveToDb'].value) {
                this.container.db.updateNode(this.id, this.container.id,
                    { $unset: { "properties.log": true } });
            }
        }
    };
}

Container.registerNodeType("ui/log", UiLogNode);

