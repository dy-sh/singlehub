/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../node";
import { Container, Side } from "../container";
import Utils from "../utils";
import { setOptions } from "serialport";


class AnyToTrueNode extends Node {

    constructor() {
        super();

        this.title = "Any to true";
        this.descriprion = "This node sends \"true\" to the output, when anything comes to the input except null.<br/><br/>" +
            "In the settings of the node you can enable the option to send \"false\" immediately after \"true\".";

        this.addInput("value");
        this.addOutput("true", "boolean");

        this.settings["false"] = { description: "Generate False", value: true, type: "boolean" };
    }

    onInputUpdated() {
        if (this.getInputData(0) == null)
            return;

        this.setOutputData(0, true);
    }

    onExecute() {
        if (this.settings["false"].value
            && this.outputs[0].data == true)
            this.setOutputData(0, false);
    }
}
Container.registerNodeType("operation/any-to-true", AnyToTrueNode);


class CounterNode extends Node {
    val = 0;

    constructor() {
        super();

        this.title = "Counter";
        this.descriprion = "This node increases by 1 an internal counter " +
            "when a logical \"true\" comes  to the input \"Count Up\". <br/>" +
            "The counter decreases by 1 " +
            "when a logical \"true\" comes  to the input \"Count Down\". <br/>" +
            "You can override internal value to the specified value (Set Value). <br/>" +
            "Logical \"true\" on Reset input will set internal value to 0.";

        this.addInput("set value", "number");
        this.addInput("count up", "boolean");
        this.addInput("count down", "boolean");
        this.addInput("reset", "boolean");
        this.addOutput("count", "number");

    }

    onInputUpdated() {

        let old = this.outputs[0].data;


        if (this.inputs[1].updated && this.inputs[1].data == true)
            this.val++;

        if (this.inputs[2].updated && this.inputs[2].data == true)
            this.val--;

        if (this.inputs[0].updated)
            this.val = this.inputs[0].data;

        if (this.inputs[3].updated && this.inputs[3].data == true)
            this.val = 0;


        if (this.val !== old)
            this.setOutputData(0, this.val);
    }
}
Container.registerNodeType("operation/counter", CounterNode);


class StackNode extends Node {
    data = [];

    constructor() {
        super();

        this.title = "Stack";
        this.descriprion = "This node stores all the incoming values, and puts them in a stack. <br/>" +
            "You can read the values from the stack at any time. <br/>" +
            "Node can be used as a buffer. <br/>" +
            // "Values are stored in the database and available after restart of the server.";

            this.addInput("add value");
        this.addInput("get value", "boolean");
        this.addInput("clear", "boolean");
        this.addOutput("value");
        this.addOutput("count", "number");

    }

    onInputUpdated() {

        if (this.inputs[0].updated && this.inputs[0].data != null) {
            this.data.push(this.inputs[0].data);
            this.setOutputData(1, this.data.length);
        }

        if (this.inputs[1].updated && this.inputs[1].data == true) {
            let val = this.data.length > 0 ? this.data.pop() : null;
            this.setOutputData(0, val);
            this.setOutputData(1, this.data.length);
        }

        if (this.inputs[2].updated && this.inputs[2].data != null) {
            this.data = [];
            this.setOutputData(0, null);
            this.setOutputData(1, 0);
        }
    }
}
Container.registerNodeType("operation/stack", StackNode);


class QueueNode extends Node {
    data = [];

    constructor() {
        super();

        this.title = "Queue";
        this.descriprion = "This node stores all the incoming values, and puts them in a queue. <br/>" +
            "You can read the values from the queue at any time. <br/>" +
            "Node can be used as a buffer. <br/>" +
            "Values are stored in the database and available after restart of the server.";

        this.addInput("add value");
        this.addInput("get value", "boolean");
        this.addInput("clear", "boolean");
        this.addOutput("value");
        this.addOutput("count", "number");

    }

    onInputUpdated() {

        if (this.inputs[0].updated && this.inputs[0].data != null) {
            this.data.unshift(this.inputs[0].data);
            this.setOutputData(1, this.data.length);
        }

        if (this.inputs[1].updated && this.inputs[1].data == true) {
            let val = this.data.length > 0 ? this.data.pop() : null;
            this.setOutputData(0, val);
            this.setOutputData(1, this.data.length);
        }

        if (this.inputs[2].updated && this.inputs[2].data != null) {
            this.data = [];
            this.setOutputData(0, null);
            this.setOutputData(1, 0);
        }
    }
}
Container.registerNodeType("operation/queue", QueueNode);


class CrossfadeNode extends Node {
    constructor() {
        super();

        this.title = "Crossfade";
        this.descriprion = "This node makes the crossfade between two values. <br/>" +
            "\"Crossfade\" input takes a value from 0 to 100. <br/>" +
            "If Crossfade is 0, the output will be equal to A. <br/>" +
            "If Crossfade is 100, then the output is equal to B. <br/>" +
            "The intermediate value between 0 and 100 will give " +
            "intermediate number between A and B. ";

        this.addInput("0-100", "number");
        this.addInput("a", "number");
        this.addInput("b", "number");
        this.addOutput("a--b");

    }

    onInputUpdated() {
        let x = this.getInputData(0);
        let a = this.getInputData(1);
        let b = this.getInputData(2);

        let val = a * (1 - x / 100) + b * x / 100;

        this.setOutputData(0, val);
    }
}
Container.registerNodeType("operation/crossfade", CrossfadeNode);



class OperationTriggerNode extends Node {


    constructor() {
        super();

        this.title = "Trigger";
        this.descriprion = "If the input \"Set\" comes \"true\", the node sends \"true\" to the output. <br>" +
            "If the input \"Reset\" comes \"true\", the node sends \"false\" to the output.";

        this.addInput("set", "boolean");
        this.addInput("reset", "boolean");
        this.addOutput("value", "boolean");
    }

    onInputUpdated() {
        if (this.inputs[0].data == true && this.inputs[1].data != true)
            this.setOutputData(0, true);

        if (this.inputs[1].data == true)
            this.setOutputData(0, false);
    }
}
Container.registerNodeType("operation/trigger", OperationTriggerNode);




class OperationFlipflopNode extends Node {
    flop = false;
    state = false;
    last_val;

    constructor() {
        super();

        this.title = "Flip-Flop";
        this.descriprion = "This node divides the frequency by 2. <br/>" +
            "For example, if you send to the input of the following sequence: " +
            "1010 1010, the output is 1100 1100.";

        this.addInput("value", "boolean");
        this.addOutput("value", "boolean");

        this.settings["reset-on-disc"] = { description: "Reset on disconnected or input is null", type: "boolean", value: false };
    }

    onInputUpdated() {
        let val = this.inputs[0].data;
        if (this.last_val == val)
            return;

        if (val == null) {
            if (this.settings["reset-on-disc"].value) {
                this.last_val = val;
                this.setOutputData(0, null, true);
                this.flop = false;
                this.state = false;
            }
        } else {
            this.last_val = val;
            this.flop = !this.flop;
            if (this.flop)
                this.state = !this.state;

            this.setOutputData(0, this.state, true);
        }
    }
}
Container.registerNodeType("operation/flip-flop", OperationFlipflopNode);




class FreqDividerNode extends Node {
    counter = -1;

    constructor() {
        super();

        this.title = "Freq divider";
        this.descriprion = "This node divides the frequency. <br/>" +
            "Input \"Devide by\" specifies the number of clock cycles. <br/>" +
            "\"Width %\" input specifies the percentage width of the positive portion " +
            "of the cycle (if not set it is 50%). <br/>" +
            "Input \"Trigger\" toggles the clock cycles. <br/><br/>" +

            "For example, \"Devide by\"=4. The \"Width %\" is not connected (50). <br/>" +
            "Sending \"1\" constantly to the Trigger input, " +
            "you will get the following sequence on output: 1100 1100 1100... <br/><br/>" +

            "Or, for example, \"Devide by\"=10. The \"Width %\"=80. <br/>" +
            "Switching Trigger you will get: 1111111100 1111111100 1111111100... " +
            "(80% of 1, 20% of 0).";

        this.addInput("divide by", "number");
        this.addInput("trigger", "boolean");
        this.addInput("width %", "number");
        this.addInput("reset", "boolean");
        this.addOutput("count", "number");
    }

    onInputUpdated() {
        if (this.inputs[3].updated && this.inputs[3].data == true) {
            this.counter = -1;
            this.setOutputData(0, null);
        }

        else if (this.inputs[1].updated && this.inputs[1].data == true) {
            this.counter++;

            let divideBy = this.inputs[0].data || 0;

            let width = 50;
            if (this.inputs[2].data != null)
                width = this.inputs[2].data;


            if (this.counter >= divideBy)
                this.counter = 0;

            let val = divideBy * (width / 100) > this.counter;

            if (val != this.outputs[0].data)
                this.setOutputData(0, val);
        }
    }
}
Container.registerNodeType("operation/freq-divider", FreqDividerNode);



class OperationLinearShaperNode extends Node {
    constructor() {
        super();

        this.title = "Linear shaper";
        this.descriprion = "With this node you can set conditional curve. " +
            "The curve represents, how will change value on the output. " +
            "The Input named \"Value\" takes a value from 0 to 100. " +
            "This is a relative position on the curve. " +
            "You can create any number of points " +
            "on the curve in the settings of the node. " +
            "By default, there are three points: 0,50,100. " +
            "Each point corresponds to its input. " +
            "The value on input determines what value will be on output, " +
            "when the position will be at this point. <br/><br/>" +
            "For example, input 0=10, input 50=0, input 100=10. <br/>" +
            "Now if \"Value\" is 0, the output will be 10. <br/>" +
            "If \"Value\" is 50, the output will be 0.  <br/>" +
            "If \"Value\" is 100, the output will be 10. <br/>" +
            "Intermediate values between 0-100 " +
            "will be intermediate values between 10-50-10. <br/><br/>" +
            "Thus you can have a smooth change values as you need.";


        this.addInput("value", "number");
        this.addOutput("value");

        this.changeInputsCount(3);

        this.settings["inputs"] = { description: "Inputs count", value: 1, type: "number" };
    }

    onSettingsChanged() {
        let inputs = this.settings["inputs"].value;
        inputs = Utils.clamp(inputs, 1, 1000);
        this.changeInputsCount(inputs);

        if (this.side == Side.editor)
            this.updateInputsLabels();

        //update db
        if (this.container.db)
            this.container.db.updateNode(this.id, this.container.id, {
                $set: {
                    inputs: this.inputs,
                    outputs: this.outputs
                }
            });
    }

    changeInputsCount(count) {
        super.changeInputsCount(count + 1, "number");

        //rename inputs
        this.inputs[1].name = "0";
        for (let i = 1; i < count; i++) {
            let point = 100.0 / (count - 1) * i;
            this.inputs[i + 1].name = "" + point.toFixed(2).replace(/[.,]00$/, "");
        }
    }

    onInputUpdated() {
        let position = Utils.clamp(+this.getInputData(0), 0, 100); //50 82 10

        let pointsCount = this.getInputsCount() - 1; //4

        let stepSize = 100.0 / (pointsCount - 1); //33.3
        let stepIndex = (position / stepSize) + 1; //1.51 2.46 0.30
        let positionInStep = stepIndex - Math.floor(stepIndex);//0.51 0.46 0.30
        let startValue = (Math.floor(stepIndex) - 1) * stepSize; //33.3 66.6 0
        let endValue = startValue + stepSize; //66.6 100 33.3

        let s = this.getInputData(Math.floor(stepIndex));
        if (s != null)
            startValue = s;

        if (position >= 100) {
            this.setOutputData(0, startValue);
            return;
        }

        let e = this.getInputData(Math.floor(stepIndex) + 1);
        if (e != null)
            endValue = e;

        let result = Utils.remap(positionInStep, 0, 1, startValue, endValue);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("operation/linear-shaper", OperationLinearShaperNode);

