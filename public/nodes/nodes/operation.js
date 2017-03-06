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
            if (this.inputs[1].updated && this.inputs[1].data)
                this.val++;
            if (this.inputs[2].updated && this.inputs[2].data)
                this.val--;
            if (this.inputs[0].updated)
                this.val = this.inputs[0].data;
            if (this.inputs[3].updated && this.inputs[3].data)
                this.val = 0;
            if (this.val !== old)
                this.setOutputData(0, this.val);
        }
    }
    container_1.Container.registerNodeType("operation/counter", CounterNode);
});
//# sourceMappingURL=operation.js.map