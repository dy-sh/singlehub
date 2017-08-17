/**
 * Created by Derwish (derwish.pro@gmail.com) on 08.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../node";
import { Container } from "../container";
import Utils from "../utils";


class FiltersOnlyFromRangeNode extends Node {
    constructor() {
        super();

        this.title = "Only from range";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value only if it is in the range from Min to Max.";

        this.addInput("value", "number");
        this.addInput("min", "number");
        this.addInput("max", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let min = this.getInputData(1);
        let max = this.getInputData(2);

        if (val == null || min == null || max == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val >= min && val <= max)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-from-range", FiltersOnlyFromRangeNode);


class FiltersOnlyGreaterNode extends Node {
    constructor() {
        super();

        this.title = "Only greater";
        this.descriprion = "This node filters the input values. " +
            "It passes only those values that are greater than Treshold.";

        this.addInput("value", "number");
        this.addInput("treshold", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let treshold = this.getInputData(1);

        if (val == null || treshold == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val > treshold)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-greater", FiltersOnlyGreaterNode);


class FiltersOnlyLowerNode extends Node {
    constructor() {
        super();

        this.title = "Only lower";
        this.descriprion = "This node filters the input values. " +
            "It passes only those values that are lower than or equal to Treshold.";

        this.addInput("value", "number");
        this.addInput("treshold", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let treshold = this.getInputData(1);

        if (val == null || treshold == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val < treshold)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-lower", FiltersOnlyLowerNode);


class FiltersOnlyEqualNode extends Node {
    constructor() {
        super();

        this.title = "Only equal";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value from input named \"Value\" " +
            "only if it is equal to \"Sample\".";

        this.addInput("value");
        this.addInput("sample");
        this.addOutput("value");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let sample = this.getInputData(1);

        if (val == null || sample == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val == sample)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-equal", FiltersOnlyEqualNode);


class FiltersOnlyTrueNode extends Node {
    constructor() {
        super();

        this.title = "Only true";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value only if it is a \"true\".";

        this.addInput("value", "boolean");
        this.addOutput("true", "boolean");
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val == true)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-true", FiltersOnlyTrueNode);


class FiltersOnlyFalseNode extends Node {
    constructor() {
        super();

        this.title = "Only false";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value only if it is a \"false\".";

        this.addInput("value", "boolean");
        this.addOutput("false", "boolean");
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val == false)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-false", FiltersOnlyFalseNode);


class FiltersPreventNullNode extends Node {
    constructor() {
        super();

        this.title = "Prevent null";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value only if it is not a null.";

        this.addInput("value");
        this.addOutput("value");
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val != null)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/prevent-null", FiltersPreventNullNode);


class FiltersPreventEqualNode extends Node {
    constructor() {
        super();

        this.title = "Prevent null";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value from input named \"Value\" " +
            "only if it is not equal to \"Sample\".";

        this.addInput("value");
        this.addInput("sample");
        this.addOutput("value");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let sample = this.getInputData(1);

        if (val == null || sample == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val != sample)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/prevent-equal", FiltersPreventEqualNode);


class FiltersPreventDuplicatesNode extends Node {
    lastVal: any;

    constructor() {
        super();

        this.title = "Prevent duplicates";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value only if it is not the same " +
            "that was already sent to the output.";


        this.addInput("value");
        this.addOutput("value");
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (this.lastVal == val)
            return;

        this.lastVal = val;
        this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/prevent-duplicates", FiltersPreventDuplicatesNode);




class FiltersReduceEventsNode extends Node {
    lastTime: number;
    lastValue: any;
    waitingToSend: boolean;

    constructor() {
        super();

        this.title = "Reduce events";
        this.descriprion = "This node reduces the number of transmitted values. <br/><br/>" +
            "When the value on the input is changed, " +
            "the node sends it to the output and stops " +
            "receiving at a specified time interval. <br/>" +
            "The values that come at this time are simply ignored, " +
            "but the last value will be stored if it is enabled in the settings. <br/>" +
            "When the interval passes, the last value is sent to the output. " +
            "This reduces the number of events, if they are sent too often, but" +
            "ensures that the node will always send the last actual value. <br/><br/>" +
            "You can disable the sending of the last value in the settings of the node. " +
            "This may be necessary if you do not want to receive messages late, " +
            "but then it is not guaranteed that the nodes connected to this node " +
            "will have the last actual value.<br>" +
            "If you activate Reset pin, the node will reset the timer " +
            "and send the last value, if it is enabled in the settings. ";


        this.addInput("value");
        this.addInput("[interval]", "number");
        this.addInput("[reset]", "boolean");
        this.addOutput("value");

        this.settings["sendlast"] = { description: "Store and send last value", value: true, type: "boolean" };
        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };

        this.lastTime = Date.now();
    }

    onInputUpdated() {
        if (this.inputs[2].updated && this.inputs[2].data) {
            this.lastTime = 0;
        }
        if (this.inputs[0].updated) {
            let interval = this.getInterval();

            if ((Date.now() - this.lastTime) >= interval) {
                this.lastTime = Date.now();
                this.setOutputData(0, this.inputs[0].data)
            } else {
                if (this.settings["sendlast"].value == true) {
                    this.lastValue = this.inputs[0].data;
                    this.waitingToSend = true;
                }
            }
        }
    }

    onExecute() {
        if (!this.waitingToSend)
            return;

        let interval = this.getInterval();

        if ((Date.now() - this.lastTime) < interval)
            return;

        this.lastTime = Date.now();
        this.setOutputData(0, this.lastValue)
        this.waitingToSend = false;
    }

    private getInterval(): number {
        let interval = this.getInputData(1);
        if (interval == null)
            interval = this.settings["interval"].value;

        return interval;
    }
}
Container.registerNodeType("filters/reduce-events", FiltersReduceEventsNode);



class FiltersReduceDuplicatesNode extends Node {
    lastTime: number;
    lastValue: any;
    waitingToSend: boolean;

    constructor() {
        super();

        this.title = "Reduce Duplicates";
        this.descriprion = "This node reduces the number of duplicated transmitted values. <br/><br/>" +
            "When the value on the input is changed, " +
            "the node sends it to the output and stops " +
            "receiving the same value at a specified time interval. <br/>" +
            "The values that come at this time and that are the same are simply ignored, " +
            "but the last value will be stored if it is enabled in the settings. <br/>" +
            "When the interval passes, the last value is sent to the output. " +
            "This reduces the number of events, if they are sent too often, but" +
            "ensures that the node will always send the last actual value. <br/><br/>" +
            "You can disable the sending of the last value in the settings of the node. " +
            "This may be necessary if you do not want to receive messages late, " +
            "but then it is not guaranteed that the nodes connected to this node " +
            "will have the last actual value.<br>" +
            "If you activate Reset pin, the node will reset the timer " +
            "and send the last value, if it is enabled in the settings. ";


        this.addInput("value");
        this.addInput("[interval]", "number");
        this.addInput("[reset]", "boolean");
        this.addOutput("value");

        this.settings["sendlast"] = { description: "Store and send last value", value: true, type: "boolean" };
        this.settings["interval"] = { description: "Interval", value: 1000, type: "number" };

        this.lastTime = Date.now();
    }

    onInputUpdated() {
        if (this.inputs[2].updated && this.inputs[2].data) {
            this.lastTime = 0;
        }
        if (this.inputs[0].updated) {
            let interval = this.getInterval();

            if ((Date.now() - this.lastTime) >= interval || this.inputs[0].data != this.lastValue) {
                this.lastValue = this.inputs[0].data;
                this.lastTime = Date.now();
                this.setOutputData(0, this.inputs[0].data)
            } else {
                if (this.settings["sendlast"].value == true) {
                    this.waitingToSend = true;
                }
            }
        }
    }

    onExecute() {
        if (!this.waitingToSend)
            return;

        let interval = this.getInterval();

        if ((Date.now() - this.lastTime) < interval)
            return;

        this.lastTime = Date.now();
        this.setOutputData(0, this.lastValue)
        this.waitingToSend = false;
    }

    private getInterval(): number {
        let interval = this.getInputData(1);
        if (interval == null)
            interval = this.settings["interval"].value;

        return interval;
    }
}
Container.registerNodeType("filters/reduce-duplicates", FiltersReduceDuplicatesNode);