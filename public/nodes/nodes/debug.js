(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../nodes"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../nodes");
    /**
     * Created by derwish on 11.02.17.
     */
    //Watch a value in the editor
    class Watch extends nodes_1.Node {
        constructor() {
            super();
            this.onGetMessageFromBackSide = function (data) {
                this.properties.value = data.value;
                this.showValueOnInput(data.value);
            };
            this.title = "Watch";
            this.desc = "Show value of input";
            this.size = [60, 20];
            this.addInput("value", null, { label: "" });
            this.addOutput("value", null, { label: "" });
        }
        onExecute() {
            let val = this.getInputData(0);
            this.setOutputData(0, val);
            this.sendMessageToFrontSide({ value: val });
        }
        showValueOnInput(value) {
            //show the current value
            if (value) {
                if (typeof (value) == "number")
                    this.inputs[0].label = value.toFixed(3);
                else {
                    let str = value;
                    if (str && str.length)
                        str = Array.prototype.slice.call(str).join(",");
                    this.inputs[0].label = str;
                }
            }
            else
                this.inputs[0].label = "";
            this.setDirtyCanvas(true, false);
        }
    }
    exports.Watch = Watch;
    nodes_1.Nodes.registerNodeType("debug/watch", Watch);
    //Show value inside the debug console
    class Console extends nodes_1.Node {
        constructor() {
            super();
            this.onExecute = function () {
                let val = this.getInputData(0);
                if (val != this.oldVal) {
                    console.log("CONSOLE NODE: " + val);
                    this.isActive = true;
                    this.oldVal = val;
                }
            };
            this.title = "Console";
            this.desc = "Show value inside the console";
            this.size = [60, 20];
            this.addInput("data");
        }
    }
    exports.Console = Console;
    nodes_1.Nodes.registerNodeType("debug/console", Console);
});
//# sourceMappingURL=debug.js.map