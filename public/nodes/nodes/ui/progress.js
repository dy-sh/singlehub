/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui blue small progress" id="progressBar-{{id}}">\
            <div class="bar">\
                <div class="progress"></div>\
            </div>\
        </div>\
    </div>';
    class UiProgressNode extends ui_node_1.UiNode {
        constructor() {
            super("Progress", template);
            this.UPDATE_INTERVAL = 100;
            this.dataUpdated = false;
            this.descriprion = "";
            this.properties['value'] = 0;
            this.addInput("input", "number");
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
            let val = this.getInputData(0);
            if (val > 100)
                val = 100;
            if (val < 0)
                val = 0;
            this.properties['value'] = val;
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
            $('#progressBar-' + this.id).progress({
                percent: data.value,
                showActivity: false
            });
        }
        ;
    }
    exports.UiProgressNode = UiProgressNode;
    container_1.Container.registerNodeType("ui/progress", UiProgressNode);
});
//# sourceMappingURL=progress.js.map