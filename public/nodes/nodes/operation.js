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
            this.val = 0;
            this.title = "Any to true";
            this.descriprion = "This node sends \"true\" to the output, when anything comes to the input except null.<br/><br/>" +
                "In the settings of the node you can enable the option to send \"false\" immediately after \"true\".";
            this.addInput("value", "number");
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
});
//# sourceMappingURL=operation.js.map