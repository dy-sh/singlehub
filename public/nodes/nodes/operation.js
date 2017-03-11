/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../node", "../container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("../node");
    const container_1 = require("../container");
    class AnyToTrueNode extends node_1.Node {
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
    container_1.Container.registerNodeType("operation/any-to-true", AnyToTrueNode);
    class CounterNode extends node_1.Node {
        constructor() {
            super();
            this.val = 0;
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
    container_1.Container.registerNodeType("operation/counter", CounterNode);
    class StackNode extends node_1.Node {
        constructor() {
            super();
            this.data = [];
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
    container_1.Container.registerNodeType("operation/stack", StackNode);
    class QueueNode extends node_1.Node {
        constructor() {
            super();
            this.data = [];
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
    container_1.Container.registerNodeType("operation/queue", QueueNode);
    class CrossfadeNode extends node_1.Node {
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
    container_1.Container.registerNodeType("operation/crossfade", CrossfadeNode);
    class FreqDividerNode extends node_1.Node {
        constructor() {
            super();
            this.counter = -1;
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
    container_1.Container.registerNodeType("operation/freq-divider", FreqDividerNode);
});
//# sourceMappingURL=operation.js.map