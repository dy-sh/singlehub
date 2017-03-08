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
        <button class="ui right floated small button" id="button-{{id}}">\
            &nbsp <span id="nodeTitle-{{id}}"></span> &nbsp\
        </button>\
    </div>';
    class UiButtonNode extends ui_node_1.UiNode {
        constructor() {
            super("Button", template);
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
                $('#button-' + this.id).click(function () {
                    that.sendMessageToServerSide('click');
                });
            }
        }
        onGetMessageToServerSide(data) {
            this.isRecentlyActive = true;
            this.properties['value'] = true;
            this.setOutputData(0, true);
            this.sendIOValuesToEditor();
        }
        ;
        onExecute() {
            if (this.properties['value'] == true) {
                this.properties['value'] = false;
                this.setOutputData(0, false);
            }
        }
    }
    exports.UiButtonNode = UiButtonNode;
    container_1.Container.registerNodeType("ui/button", UiButtonNode);
});
//# sourceMappingURL=button.js.map