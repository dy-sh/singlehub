/**
 * Created by Derwish (derwish.pro@gmail.com) on 26.02.17.
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
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
    <button class="ui right floated small toggle button" id="button-{{id}}">\
    &nbsp <span id="nodeTitle-{{id}}"></span> &nbsp\
    </button>\
    </div>';
    class UiToggleNode extends ui_node_1.UiNode {
        constructor() {
            super("Toggle", template);
            this.descriprion = "Toggle button";
            this.properties['value'] = false;
            this.addOutput("output", "boolean");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.server)
                this.setOutputData(0, this.properties['value']);
            if (this.side == container_1.Side.dashboard) {
                let that = this;
                $('#button-' + this.id).click(function () {
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
            $('#buttonName-' + this.id).html(this.title);
            if (data.value)
                $('#button-' + this.id).addClass("blue");
            else
                $('#button-' + this.id).removeClass("blue");
        }
        ;
    }
    exports.UiToggleNode = UiToggleNode;
    container_1.Container.registerNodeType("ui/toggle", UiToggleNode);
});
//# sourceMappingURL=toggle.js.map