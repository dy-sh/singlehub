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
    class AndNode extends node_1.Node {
        constructor() {
            super();
            this.title = "AND";
            this.descriprion = "This node performs a logical \"AND\" operation. ";
            this.addInput("a", "boolean");
            this.addInput("b", "boolean");
            this.addOutput("a && b", "boolean");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, a && b);
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/and", AndNode);
    class OrNode extends node_1.Node {
        constructor() {
            super();
            this.title = "OR";
            this.descriprion = "This node performs a logical \"OR\" operation. ";
            this.addInput("a", "boolean");
            this.addInput("b", "boolean");
            this.addOutput("a || b", "boolean");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, a || b);
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/or", OrNode);
    class EqualNode extends node_1.Node {
        constructor() {
            super();
            this.title = "Equal";
            this.descriprion = "This node compares two values and sends \"true\" to the output " +
                "if the values are equal, or \"false\" if not equal. <br/>" +
                "It can compare text or numbers. <br/>" +
                "For example, the node will assume that \"1\" and \"1.0\" are equal. <br/>" +
                "\"Hello\" and \"HELLO\" are not equal. ";
            this.addInput("a");
            this.addInput("b");
            this.addOutput("a == b", "boolean");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, a == b);
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/equal", EqualNode);
    class NotNode extends node_1.Node {
        constructor() {
            super();
            this.title = "NOT";
            this.descriprion = "This node works the opposite of how the Equal node works.";
            this.addInput("a", "boolean");
            this.addInput("b", "boolean");
            this.addOutput("a != b", "boolean");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, a != b);
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/not", NotNode);
    class MaxNode extends node_1.Node {
        constructor() {
            super();
            this.title = "Max";
            this.descriprion = "Compares two numbers and return the highest value.";
            this.addInput("a", "number");
            this.addInput("b", "number");
            this.addOutput("max(a,b)", "number");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, Math.max(a, b));
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/max", MaxNode);
    class MinNode extends node_1.Node {
        constructor() {
            super();
            this.title = "Min";
            this.descriprion = "Compares two numbers and return the lowest value.";
            this.addInput("a", "number");
            this.addInput("b", "number");
            this.addOutput("min(a,b)", "number");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, Math.min(a, b));
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/min", MinNode);
    class GreaterNode extends node_1.Node {
        constructor() {
            super();
            this.title = "Greater";
            this.descriprion = "This node compares two values and sends \"true\" to the output " +
                "if the first value is greater than the second, or \"false\" if not. <br/>" +
                "It can compare only numbers. ";
            this.addInput("a", "number");
            this.addInput("b", "number");
            this.addOutput("a > b", "boolean");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            if (a != null && b != null)
                this.setOutputData(0, a > b);
            else
                this.setOutputData(0, null);
        }
    }
    container_1.Container.registerNodeType("compare/greater", GreaterNode);
});
//# sourceMappingURL=compare.js.map