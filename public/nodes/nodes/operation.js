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
});
//# sourceMappingURL=operation.js.map