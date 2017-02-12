(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../nodes", "../node", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../nodes");
    const node_1 = require("../node");
    const utils_1 = require("../utils");
    /**
     * Created by derwish on 11.02.17.
     */
    //Watch a value in the editor
    class WatchNode extends node_1.Node {
        constructor() {
            super();
            this.onInputUpdated = function () {
                let val = this.getInputData(0);
                this.sendMessageToFrontSide({ value: val });
            };
            this.onGetMessageFromBackSide = function (data) {
                this.properties.value = data.value;
                this.showValueOnInput(data.value);
            };
            this.title = "Watch";
            this.desc = "Show value of input";
            this.size = [60, 20];
            this.addInput("value", null, { label: "" });
        }
        showValueOnInput(value) {
            //show the current value
            let val = utils_1.default.formatAndTrimValue(value);
            this.inputs[0].label = val;
            this.setDirtyCanvas(true, false);
        }
    }
    exports.WatchNode = WatchNode;
    nodes_1.Nodes.registerNodeType("debug/watch", WatchNode);
    //Show value inside the debug console
    class ConsoleNode extends node_1.Node {
        constructor() {
            super();
            this.onInputUpdated = function () {
                let val = this.getInputData(0);
                console.log("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + val);
                this.sendMessageToFrontSide({ value: val });
            };
            this.onGetMessageFromBackSide = function (data) {
                console.log("CONSOLE NODE [" + this.container.id + "/" + this.id + "]: " + data.value);
            };
            this.title = "Console";
            this.desc = "Show value inside the console";
            this.size = [60, 20];
            this.addInput("data");
        }
    }
    exports.ConsoleNode = ConsoleNode;
    nodes_1.Nodes.registerNodeType("debug/console", ConsoleNode);
});
//# sourceMappingURL=debug.js.map