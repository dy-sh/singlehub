/**
 * Created by Derwish (derwish.pro@gmail.com) on 11.02.17.
 */

import {Nodes} from "../nodes";
import {Node} from "../node";
import Utils from "../utils";


//console logger back and front
let log;
declare let Logger: any; // tell the ts compiler global variable is defined
if (typeof (window) === 'undefined') //for backside only
    log = require('logplease').create('node', {color: 5});
else  //for frontside only
    log = Logger.create('node', {color: 5});


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
        this.size = [60, 20];
        this.addInput("", null, {label: ""});
        this.startSending();
    }

    startSending() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToEditorSide({value: that.lastData});
            }
        }, this.UPDATE_INTERVAL);
    }

    onInputUpdated = function () {
        this.lastData = this.getInputData(0);
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };

    onGetMessageToEditorSide = function (data) {
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
Nodes.registerNodeType("debug/watch", WatchNode);




//Show value inside the debug console
export class ConsoleNode extends Node {
    MAX_MESS_PER_SEC = 10;
    messagesPerSec = 0;

    constructor() {
        super();
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
                that.sendMessageToEditorSide({dropped: dropped});
            }

            that.messagesPerSec = 0;
        }, 1000);
    }

    onInputUpdated = function () {
        let val = this.getInputData(0);
        this.isRecentlyActive = true;

        this.messagesPerSec++;
        if (this.messagesPerSec <= this.MAX_MESS_PER_SEC) {
            log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
            this.sendMessageToEditorSide({value: val});
        }
    };

    onGetMessageToEditorSide = function (data) {

        if (data.value)
            log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + data.value);

        if (data.dropped)
            log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: dropped " + data.dropped + " messages due to too many");
    };
}
Nodes.registerNodeType("debug/console", ConsoleNode);

