import {Nodes} from "../nodes";
import {Node} from "../node";
import Utils from "../utils";

/**
 * Created by derwish on 11.02.17.
 */


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
        console.log("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
        this.sendMessageToFrontSide({value: val});
    };

    onGetMessageFromBackSide = function (data) {
        console.log("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + data.value);
    };
}
Nodes.registerNodeType("debug/console", ConsoleNode);

