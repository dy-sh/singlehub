/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../node";
import { Container } from "../container";
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


        this.addInput("[interval]", "number");
        this.addInput("enable", "boolean");
        this.addOutput("tick", "boolean");


        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };
        this.settings["false"] = { description: "Generate False", value: true, type: "boolean" };

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
        this.addInput("[interval]", "number");
        this.addOutput("value");

        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };
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
        this.addInput("[reset]", "boolean");
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

        this.settings["add_outs"] = { description: "Day, month, year outputs", value: false, type: "boolean" };
    }

    onAfterSettingsChange() {
        let outputsCount = this.getOutputsCount();
        if (this.settings["add_outs"].value == true && outputsCount == 4) {
            this.addOutput("day", "number");
            this.addOutput("month", "number");
            this.addOutput("year", "number");
            if (this.container.db)
                this.container.db.updateNode(this.id, this.container.id, { $set: { outputs: this.outputs } });
        }
        else if (this.settings["add_outs"].value == false && outputsCount == 7) {
            this.removeOutput(6);
            this.removeOutput(5);
            this.removeOutput(4);
            if (this.container.db)
                this.container.db.updateNode(this.id, this.container.id, { $set: { outputs: this.outputs } });
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


export class TimeFrequencyMeterNode extends Node {
    count = 0;
    countWas = 0;

    constructor() {
        super();
        this.title = "Frequency meter";
        this.descriprion = "This node measures the rate at which events arrive at the input. <br/>" +
            "Any value including null will be taken.";

        this.addInput("value");
        this.addOutput("Events/sec", "number", { data: 0 });
        // this.setOutputData(1, 0);

        setInterval(() => {
            if (this.count != this.countWas) {
                this.setOutputData(0, this.count);
            }
            this.countWas = this.count;
            this.count = 0;
        }, 1000);
    }

    onInputUpdated() {
        this.count++;
    }
}
Container.registerNodeType("time/frequency-meter", TimeFrequencyMeterNode);



export class TimeFadeNode extends Node {
    startTime: number;
    enabled = false;

    constructor() {
        super();
        this.title = "Fade";
        this.descriprion = "This node makes a smooth transition from one value to another. <br/>" +
            "You can specify the time interval for which the value must change. <br/>" +
            "The output is named \"Enabled\" sends \"1\" " +
            "when the node is in the active state (makes the transition). <br/>" +
            "In the settings of the node you can increase the refresh rate " +
            "to make the transition more smoother. " +
            "Or, reduce the refresh rate to reduce CPU load.";

        this.addInput("[from value]", "number");
        this.addInput("[to value]", "number");
        this.addInput("[interval]", "number");
        this.addInput("start/stop", "boolean");

        this.addOutput("value");
        this.addOutput("enabled", "boolean");

        this.setOutputData(1, false);

        this.settings["update-interval"] = { description: "Output Update Interval", value: 50, type: "number" };
        this.settings["reset-on-stop"] = { description: "Reset on Stop", value: false, type: "boolean" };
    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onAfterSettingsChange() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[3].updated) {
            this.enabled = this.inputs[3].data;
            this.setOutputData(1, this.enabled);
            //start
            if (this.enabled) {
                this.setOutputData(0, this.inputs[0].data)
                this.startTime = Date.now();
                this.executeLastTime = 0;
            }
            else {
                if (this.settings["reset-on-stop"].value)
                    this.setOutputData(0, this.getInputData(0))
            }
        }
    }

    onExecute() {
        if (!this.enabled)
            return;

        let from = this.getInputData(0) || 0;
        let to = this.getInputData(1) || 100;
        let interval = this.getInputData(2) || 1000;

        if (from == null || to == null)
            return;

        let elapsed = Date.now() - this.startTime;

        if (elapsed >= interval) {
            this.setOutputData(0, to);
            this.setOutputData(1, false);
            this.enabled = false;
        } else {
            let val = Utils.remap(this.startTime + elapsed, this.startTime, this.startTime + interval, from, to);
            this.setOutputData(0, val);
        }
    }
}
Container.registerNodeType("time/fade", TimeFadeNode);




export class TimeIntervalTimerNode extends Node {
    startTime: number;
    enabled = false;

    constructor() {
        super();
        this.title = "Interval Timer";
        this.descriprion = "This node represents a timer. <br/>" +
            "You can set the time interval and activate the timer, " +
            "giving \"1\" to the input named \"Start/Stop\". <br/>" +
            "After specified time interval, the output named \"Elapsed\" sends \"1\". <br/>" +
            "The output named \"Enabled\" sends \"1\" " +
            "when the timer is in the active state. <br/>" +
            "The output named \"Progress\" sends " +
            "the current state of the timer in percentage " +
            "(what percentage of the time interval has expired). ";

        this.addInput("[interval]", "number");
        this.addInput("start/stop", "number");

        this.addOutput("elapsed", "boolean");
        this.addOutput("enabled", "boolean");
        this.addOutput("progress", "number");

        this.setOutputData(0, false);
        this.setOutputData(1, false);
        this.setOutputData(2, 0);

        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };
        this.settings["update-interval"] = { description: "Update Interval", value: 50, type: "number" };
        this.settings["elapsed-true-at-stop"] = { description: "Set elapsed to true at early stop", value: false, type: "boolean" };
        this.settings["progress-100-at-stop"] = { description: "Set progress to 100 at early stop", value: false, type: "boolean" };
    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onAfterSettingsChange() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[1].updated) {
            if (this.inputs[1].data)
                this.start();
            else
                this.stop();
        }
    }

    start() {
        this.enabled = true;
        this.setOutputData(0, false, true)
        this.setOutputData(1, true);
        this.setOutputData(2, 0);
        this.startTime = Date.now();
        this.executeLastTime = 0;
    }

    stop() {
        this.enabled = false;

        if (this.settings["elapsed-true-at-stop"].value)
            this.setOutputData(0, true, true)

        this.setOutputData(1, false, true);

        if (this.settings["progress-100-at-stop"].value)
            this.setOutputData(2, 100, true);

    }

    onExecute() {
        if (!this.enabled)
            return;

        let interval = this.getInputData(0);
        if (interval == null)
            interval = this.settings["interval"].value;

        let elapsed = Date.now() - this.startTime;

        let progress = Utils.remap(this.startTime + elapsed, this.startTime, this.startTime + interval, 0, 100);
        if (progress > 100)
            progress = 100;
        this.setOutputData(2, progress, true);

        if (elapsed >= interval) {
            this.setOutputData(0, true);
            this.stop();
        }

    }
}
Container.registerNodeType("time/interval-timer", TimeIntervalTimerNode);




export class TimeIteratorNode extends Node {

    enabled: boolean;
    lastTime: number;
    count = 1;

    constructor() {
        super();
        this.title = "Iterator";
        this.descriprion = "This node generates a logical \"1\" specified number " +
            "of times with specified time interval. <br/>" +
            "You can set the time interval and activate the timer, " +
            "giving \"1\" to the input named \"Start\". <br/>" +
            "The timer will send \"1\" to the output named \"Trigger\" " +
            "as many times as specified by the input named \"Enents Count\". <br/>" +
            "The output named \"Enabled\" sends \"1\" " +
            "when the timer is in the active state, and switches to \"0\" " +
            "when the timer has finished to work. <br/>" +
            "If \"Generate False\" option is enabled in the settings of the node, " +
            "node will generate a sequence like 101010... " +
            "If disabled, the output will be 111111...";


        this.addInput("[interval]", "number");
        this.addInput("enents count", "number");
        this.addInput("start", "boolean");
        this.addInput("[stop]", "boolean");
        this.addOutput("tick", "boolean");
        this.addOutput("enabled", "boolean");
        this.addOutput("count", "number");


        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };
        this.settings["false"] = { description: "Generate False", value: true, type: "boolean" };

    }


    onInputUpdated() {
        if (this.inputs[2].updated && this.inputs[2].data)
            this.start();

        if (this.inputs[3].updated && this.inputs[3].data)
            this.stop();
    }


    start() {
        let needCount = this.inputs[1].data || 0;
        if (needCount != 0) {
            this.enabled = true;
            this.setOutputData(0, true)
            this.setOutputData(1, true);
            this.count = 1;
            this.setOutputData(2, this.count);
            this.executeLastTime = 0;
            this.lastTime = Date.now();
        }

        if (needCount == 1 && !this.settings["false"].value)
            this.stop();
    }

    stop() {
        this.enabled = false;
        this.setOutputData(1, false);
    }

    onExecute() {
        if (!this.enabled)
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

                let needCount = this.inputs[1].data || 0;
                if (this.count >= needCount)
                    this.stop();

                return;
            }
        }

        if (now - this.lastTime >= interval) {
            this.lastTime = now;
            this.setOutputData(0, true);

            this.count++;
            this.setOutputData(2, this.count);

            if (!this.settings["false"].value) {
                let needCount = this.inputs[1].data || 0;
                if (this.count >= needCount)
                    this.stop();
            }
        }
    }
}
Container.registerNodeType("time/iterator", TimeIteratorNode);




export class TimeSmoothByTimeNode extends Node {
    startTime: number;
    enabled = false;
    from: number;
    to: number;

    constructor() {
        super();
        this.title = "Smooth by Time";
        this.descriprion = "This node makes a smooth transition of values. <br/>" +
            "It avoids abrupt changes of the value on the output. <br/><br/>" +

            "The input named \"Interval\" specifies the time " +
            "for which the output should change completely. <br/><br/>" +

            "For example, you set the interval to 1000 MS. <br/>" +
            "Send \"10\" to the input. The node gradually changes the output value, " +
            "and after 1000 MS it will be equal to \"10\". <br/>" +
            "Then you send \"20\", and after 1000 MS a value " +
            "of the output will be 20, but between 10 and 20 will " +
            "be 11,12,13,14,15,16,17,18,19. <br/><br/>" +

            "In the settings of the node you can increase the refresh rate " +
            "to make the transition more smoother. " +
            "Or, reduce the refresh rate to reduce CPU load.";

        this.addInput("value", "string");
        this.addInput("[interval]", "number");

        this.addOutput("value", "string");
        this.addOutput("enabled", "boolean");

        this.setOutputData(1, false);

        this.settings["update-interval"] = { description: "Output Update Interval", value: 50, type: "number" };
        this.settings["start-value"] = { description: "Default value at start", value: 0, type: "number" };
        this.settings["stop-on-disc"] = { description: "Stop when input value is null (disconnected)", value: false, type: "boolean" };
        this.settings["null-on-disc"] = { description: "Send null when input value is null (disconnected)", value: false, type: "boolean" };
    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onAfterSettingsChange() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[0].updated) {
            if (this.inputs[0].data != null) {
                this.start();
            }
            else {
                if (this.settings["stop-on-disc"].value)
                    this.stop();

                if (this.settings["null-on-disc"].value)
                    this.setOutputData(0, null);
            }
        }
    }


    start() {
        this.to = +this.inputs[0].data;
        this.from = +this.outputs[0].data || +this.settings["start-value"].value || 0;
        this.startTime = Date.now();
        this.executeLastTime = 0;
        this.setOutputData(1, true);
        this.enabled = true;
    }

    stop() {
        this.setOutputData(1, false);
        this.enabled = false;
    }

    onExecute() {
        if (!this.enabled)
            return;

        let interval = this.getInputData(1) || 1000;

        let elapsed = Date.now() - this.startTime;

        if (elapsed >= interval) {
            this.setOutputData(0, this.to);
            this.stop();
            return;
        }

        let res = Utils.remap(this.startTime + elapsed, this.startTime, this.startTime + interval, this.from, this.to);

        this.setOutputData(0, res);
    }
}
Container.registerNodeType("time/smooth-by-time", TimeSmoothByTimeNode);







export class TimeSmoothByRangeNode extends Node {
    lastTime: number;
    enabled = false;
    to: number;

    constructor() {
        super();
        this.title = "Smooth by Range";
        this.descriprion = "This node makes a smooth transition of values. <br/>" +
            "It avoids abrupt changes of the value on the output. <br/><br/>" +

            "The input named \"Max/s\" sets the limit range at which " +
            "the output can change in 1 second. <br/><br/>" +

            "For example, you set the Max/s to \"5\". <br/>" +
            "Send \"10\" to the input. The node gradually changes the output value to 10. <br/>" +
            "Then you send \"20\", and after 2 seconds a value " +
            "of the output will be 20, but between 10 and 20 will " +
            "be 11,12,13,14,15,16,17,18,19. <br/><br/>" +

            "In the settings of the node you can increase the refresh rate " +
            "to make the transition more smoother. " +
            "Or, reduce the refresh rate to reduce CPU load.";

        this.addInput("value", "string");
        this.addInput("max/s", "number");

        this.addOutput("value", "string");
        this.addOutput("enabled", "boolean");

        this.setOutputData(1, false);

        this.settings["update-interval"] = { description: "Output Update Interval", value: 50, type: "number" };
        this.settings["start-value"] = { description: "Default value at start", value: 0, type: "number" };
        this.settings["stop-on-disc"] = { description: "Stop when input value is null (disconnected)", value: false, type: "boolean" };
        this.settings["null-on-disc"] = { description: "Send null when input value is null (disconnected)", value: false, type: "boolean" };
    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onAfterSettingsChange() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[0].updated) {
            if (this.inputs[0].data != null) {
                this.start();
            }
            else {
                if (this.settings["stop-on-disc"].value)
                    this.stop();

                if (this.settings["null-on-disc"].value)
                    this.setOutputData(0, null);
            }
        }
    }


    start() {
        this.to = +this.inputs[0].data;
        this.lastTime = Date.now();
        this.executeLastTime = 0;
        this.setOutputData(1, true);
        this.enabled = true;
    }

    stop() {
        this.setOutputData(1, false);
        this.enabled = false;
    }

    onExecute() {
        if (!this.enabled)
            return;

        let range = this.getInputData(1);
        if (range == null) {
            this.stop();
            return;
        }


        let elapsed = Date.now() - this.lastTime;
        this.lastTime = Date.now();
        let val = this.outputs[0].data || 0;

        if (this.to >= val) {
            val += Utils.remap(elapsed, 0, 1000, 0, range);

            if (val >= this.to)
                val = this.to;
        }
        else {
            val -= Utils.remap(elapsed, 0, 1000, 0, range);

            if (val <= this.to)
                val = this.to;
        }

        this.setOutputData(0, val);

        if (val == this.to)
            this.stop();
    }
}
Container.registerNodeType("time/smooth-by-range", TimeSmoothByRangeNode);
