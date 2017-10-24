/**
 * Created by Derwish (derwish.pro@gmail.com) on 11.02.17.
 */

import { Node } from "../node";
import Utils from "../utils";
import { Container, Side } from "../container";


const log = require('logplease').create('node', { color: 5 });



//Show value inside the debug console
export class ConsoleNode extends Node {
    MAX_MESS_PER_SEC = 11;
    messagesPerSec = 0;

    constructor() {
        super();
        this.title = "Console";
        this.descriprion = "Show value inside the console";
        this.addInput("input");


    }

    onAdded() {
        if (this.side == Side.server)
            this.updateMessPerSec();
    }

    updateMessPerSec() {
        let that = this;
        setInterval(function () {
            if (that.messagesPerSec > that.MAX_MESS_PER_SEC) {
                let dropped = that.messagesPerSec - that.MAX_MESS_PER_SEC;
                log.info("CONSOLE NODE [" + that.container.id + "/" + that.id + "]: dropped " + dropped + " messages (data rate limitation)");
                that.sendMessageToEditorSide({ dropped: dropped });
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
            log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
            this.sendMessageToEditorSide({ value: val });
        }
    };

    onGetMessageToEditorSide(data) {

        if (data.value != null)
            log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + data.value);

        if (data.dropped)
            log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: dropped " + data.dropped + " messages (data rate limitation)");
    };
}
Container.registerNodeType("debug/console", ConsoleNode);


//Watch a value in the editor
export class WatchNode extends Node {
    UPDATE_INTERVAL: number;

    lastData: any;
    dataUpdated = false;

    constructor() {
        super();

        this.UPDATE_INTERVAL = 300;


        this.title = "Watch";
        this.descriprion = "Show value of input";
        this.addInput("", null, { label: "" });

    }

    onAdded() {
        if (this.side == Side.server)
            this.startSending();
    }

    startSending() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToEditorSide({ value: that.lastData });
            }
        }, this.UPDATE_INTERVAL);
    }

    onInputUpdated() {
        this.lastData = this.getInputData(0);
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };

    onGetMessageToEditorSide(data) {
        this.lastData = data.value;
        this.showValueOnInput(data.value);
    };

    showValueOnInput(value: any) {
        //show the current value
        let val = Utils.formatAndTrimValue(value);
        this.inputs[0].label = val;

        this.setDirtyCanvas(true, false);
    }

    updateInputsLabels() {
        this.showValueOnInput(this.lastData);
    }
}
Container.registerNodeType("debug/watch", WatchNode);




class EventCounterNode extends Node {
    val = 0;

    constructor() {
        super();

        this.title = "Event counter";
        this.descriprion = "This node counts how many events occurred at the \"Value\" input. <br/>" +
            "Any incoming value, including null, will be taken.";

        this.addInput("value");
        this.addInput("reset", "boolean");
        this.addOutput("count", "number");
    }

    onInputUpdated() {
        if (this.inputs[1].updated && this.inputs[1].data == true)
            this.val = 0;

        else if (this.inputs[0].updated)
            this.val++;

        if (this.val !== this.outputs[0].data)
            this.setOutputData(0, this.val);
    }
}
Container.registerNodeType("debug/event-counter", EventCounterNode);




