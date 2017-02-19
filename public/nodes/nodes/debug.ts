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
    constructor() {
        super();
        this.title = "Watch";
        this.desc = "Show value of input";
        this.size = [60, 20];
        this.addInput("value", null, {label: ""});
    }

    onInputUpdated = function () {
        let val = this.getInputData(0);
        this.isRecentlyActive = true;
        this.sendMessageToFrontSide({value: val});
    };

    onGetMessageFromBackSide = function (data) {
        this.properties.value = data.value;
        this.showValueOnInput(data.value);
    };

    showValueOnInput(value: any) {
        //show the current value
        let val = Utils.formatAndTrimValue(value);
        this.inputs[0].label = val;

        this.setDirtyCanvas(true, false);
    }
}
Nodes.registerNodeType("debug/watch", WatchNode);

//Show value inside the debug console
export class ConsoleNode extends Node {
    constructor() {
        super();
        this.title = "Console";
        this.desc = "Show value inside the console";
        this.size = [60, 20];
        this.addInput("data");
    }


    onInputUpdated = function () {
        let val = this.getInputData(0);
        this.isRecentlyActive = true;
        log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
        this.sendMessageToFrontSide({value: val});
    };

    onGetMessageFromBackSide = function (data) {
        log.info("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + data.value);
    };
}
Nodes.registerNodeType("debug/console", ConsoleNode);

