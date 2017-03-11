/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


export class TickerNode extends Node {


    lastTime: number;

    constructor() {
        super();
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


        this.settings["interval"] = {description: "Interval", value: 1000, type: "number"};
        this.settings["false"] = {description: "Generate False", value: true, type: "boolean"};

    }


    onExecute() {
        let enable = this.getInputData(1);
        if (enable == false)
            return;

        let now = Date.now();
        if (!this.lastTime)
            this.lastTime = now;

        let interval = this.getInputData(0);
        if (interval == null)
            interval = this.settings["interval"].value;

        let val = this.outputs[0].data;

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
    }
}
Container.registerNodeType("time/ticker", TickerNode);


export class DelayNode extends Node {
    delayedValues = [];

    constructor() {
        super();
        this.title = "Delay";
        this.descriprion = "This node introduces a delay in the flow of events. <br/>" +
            "All incoming values (including null) " +
            "will be sent to the output after a specified time interval.";

        this.addInput("value");
        this.addInput("interval", "boolean");
        this.addOutput("value");

        this.settings["interval"] = {description: "Interval", value: 1000, type: "number"};
    }

    onInputUpdated() {
        if (this.inputs[0].updated)
            this.delayedValues.push({
                val: this.inputs[0].data,
                time: Date.now()
            });
    }

    onExecute() {
        if (this.delayedValues.length == 0)
            return;

        let interval = this.getInputData(1);
        if (interval == null)
            interval = this.settings["interval"].value;

        let val = this.delayedValues[0];
        if (Date.now() - val.time >= interval) {
            this.delayedValues.shift();
            this.setOutputData(0, val.val);
            return;
        }
    }
}
Container.registerNodeType("time/delay", DelayNode);


export class DelayMeterNode extends Node {
    lastTime;

    constructor() {
        super();
        this.title = "Delay meter";
        this.descriprion = "This node measures the delay between the incoming events. <br/>" +
            "Any value sent to the input (excluding null) will be accepted.";

        this.addInput("value");
        this.addInput("reset", "boolean");
        this.addOutput("ms", "number");
    }

    onInputUpdated() {
        if (this.inputs[1].updated && this.inputs[1].data == true) {
            this.lastTime = null;
            this.setOutputData(0, null);
        }
        if (this.inputs[0].updated && this.inputs[0].data != null) {
            if (this.lastTime != null) {
                let delay = Date.now() - this.lastTime;
                this.setOutputData(0, delay);
            }

            this.lastTime = Date.now();
        }

    }
}
Container.registerNodeType("time/delay-meter", DelayMeterNode);


export class ClockNode extends Node {
    constructor() {
        super();
        this.title = "Clock";
        this.descriprion = "This is the system clock. <br/>" +
            "You can enable additional outputs in the node settings";

        this.addOutput("ms", "number");
        this.addOutput("sec", "number");
        this.addOutput("min", "number");
        this.addOutput("h", "number");

        this.settings["add_outs"] = {description: "Day, month, year outputs", value: false, type: "boolean"};
    }

    onSettingsChanged() {
        let outputsCount = this.getOutputsCount();
        if (this.settings["add_outs"].value == true && outputsCount == 4) {
            this.addOutput("day", "number");
            this.addOutput("month", "number");
            this.addOutput("year", "number");
            if (this.container.db)
                this.container.db.updateNode(this.id, this.container.id, {$set: {outputs: this.outputs}});
        }
        else if (this.settings["add_outs"].value == false && outputsCount == 7) {
            this.removeOutput(6);
            this.removeOutput(5);
            this.removeOutput(4);
            if (this.container.db)
                this.container.db.updateNode(this.id, this.container.id, {$set: {outputs: this.outputs}});
        }
    }

    onExecute() {
        let now = new Date();

        this.setOutputData(0, now.getMilliseconds(), true);
        this.setOutputData(1, now.getSeconds(), true);
        this.setOutputData(2, now.getMinutes(), true);
        this.setOutputData(3, now.getHours(), true);

        if (this.settings["add_outs"].value) {
            this.setOutputData(4, now.getDay(), true);
            this.setOutputData(5, now.getMonth(), true);
            this.setOutputData(6, now.getFullYear(), true);
        }
    }


}
Container.registerNodeType("time/clock", ClockNode);

