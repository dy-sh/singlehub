/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../utils", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const utils_1 = require("../../utils");
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic disabled button nonbutton">\
            <span class="ui blue basic label" id="labelValue-{{id}}"></span>\
        </div>\
    </div>';
    class UiLabelNode extends ui_node_1.UiNode {
        constructor() {
            super("Label", template);
            this.UPDATE_INTERVAL = 100;
            this.dataUpdated = false;
            this.descriprion = "Show value of input";
            this.properties['value'] = '-';
            this.addInput("input");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.server)
                this.startSendingToDashboard();
            if (this.side == container_1.Side.dashboard) {
                this.onGetMessageToDashboardSide({ value: this.properties['value'] });
            }
        }
        onInputUpdated() {
            this.properties['value'] = utils_1.default.formatAndTrimValue(this.getInputData(0));
            if (this.properties['value'] == "")
                this.properties['value'] = "-";
            this.dataUpdated = true;
            this.isRecentlyActive = true;
        }
        ;
        startSendingToDashboard() {
            let that = this;
            setInterval(function () {
                if (that.dataUpdated) {
                    that.dataUpdated = false;
                    that.sendMessageToDashboardSide({ value: that.properties['value'] });
                }
            }, this.UPDATE_INTERVAL);
        }
        onGetMessageToDashboardSide(data) {
            $('#labelValue-' + this.id).html(data.value);
        }
        ;
    }
    exports.UiLabelNode = UiLabelNode;
    container_1.Container.registerNodeType("ui/label", UiLabelNode);
});
//# sourceMappingURL=label.js.map