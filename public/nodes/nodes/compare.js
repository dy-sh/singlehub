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
});
//# sourceMappingURL=compare.js.map