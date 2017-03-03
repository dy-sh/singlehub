/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '  <div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic  button nonbutton">\
            <label class="switch">\
            <input type="checkbox" class="switch-input" id="switch-{{id}}">\
            <span class="switch-label" data-on="On" data-off="Off"></span>\
            <span class="switch-handle"></span>\
            </label>\
        </div>\
    </div>';
    class UiSwitchNode extends ui_node_1.UiNode {
        constructor() {
            super("Switch", template);
            this.descriprion = "";
            this.properties['value'] = false;
            this.addOutput("output", "boolean");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.server)
                this.setOutputData(0, this.properties['value']);
            if (this.side == container_1.Side.dashboard) {
                let that = this;
                $('#switch-' + this.id).click(function () {
                    that.sendMessageToServerSide('toggle');
                });
                this.onGetMessageToDashboardSide({ value: this.properties['value'] });
            }
        }
        onGetMessageToServerSide(data) {
            this.isRecentlyActive = true;
            let val = !this.properties['value'];
            this.properties['value'] = val;
            this.setOutputData(0, val);
            this.sendMessageToDashboardSide({ value: val });
            this.sendIOValuesToEditor();
        }
        ;
        onGetMessageToDashboardSide(data) {
            $('#switch-' + this.id).prop('checked', data.value == true);
        }
        ;
    }
    exports.UiSwitchNode = UiSwitchNode;
    container_1.Container.registerNodeType("ui/switch", UiSwitchNode);
});
//# sourceMappingURL=switch.js.map