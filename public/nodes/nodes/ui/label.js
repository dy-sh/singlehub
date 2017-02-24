/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes", "../../node", "../../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes");
    const node_1 = require("../../node");
    const utils_1 = require("../../utils");
    //Watch a value in the editor
    class WatchNode extends node_1.Node {
        constructor() {
            super();
            this.dataUpdated = false;
            this.onInputUpdated = function () {
                this.lastData = this.getInputData(0);
                this.dataUpdated = true;
                this.isRecentlyActive = true;
            };
            this.onGetMessageFromBackSide = function (data) {
                this.lastData = data.value;
                this.showValue(data.value);
            };
            this.UPDATE_INTERVAL = 300;
            this.title = "Label";
            this.descriprion = "Show value of input";
            this.size = [60, 20];
            this.addInput("input");
            this.startSending();
        }
        startSending() {
            let that = this;
            setInterval(function () {
                if (that.dataUpdated) {
                    that.dataUpdated = false;
                    that.sendMessageToDashboardSide({ value: that.lastData });
                }
            }, this.UPDATE_INTERVAL);
        }
        showValue(value) {
            //show the current value
            let val = utils_1.default.formatAndTrimValue(value);
            console.log("!!!!" + val);
            this.setDirtyCanvas(true, false);
        }
    }
    exports.WatchNode = WatchNode;
    nodes_1.Nodes.registerNodeType("ui/label", WatchNode);
});
//# sourceMappingURL=label.js.map