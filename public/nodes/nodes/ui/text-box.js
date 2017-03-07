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
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui form text-box-form">\
            <div class="ui field">\
                <div class="ui small action input">\
                    <input type="text" id="textBoxText-{{id}}">\
                    <button type="button" class="ui small button" id="textBoxSend-{{id}}">Send</button>\
                </div>\
            </div>\
        </div>\
    </div>';
    class UiTextBoxNode extends ui_node_1.UiNode {
        constructor() {
            super("TextBox", template);
            this.descriprion = "";
            this.properties['value'] = null;
            this.addOutput("output", "string");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.server)
                this.setOutputData(0, this.properties['value']);
            if (this.side == container_1.Side.dashboard) {
                let that = this;
                $('#textBoxSend-' + this.id).click(function () {
                    let value = $('#textBoxText-' + that.id).val();
                    that.sendMessageToServerSide({ value: value });
                });
                this.onGetMessageToDashboardSide({ value: this.properties['value'] });
            }
        }
        onGetMessageToServerSide(data) {
            this.isRecentlyActive = true;
            if (data.value == "")
                data.value = null;
            this.properties['value'] = data.value;
            this.setOutputData(0, data.value);
            this.sendMessageToDashboardSide(data);
            this.sendIOValuesToEditor();
        }
        ;
        onGetMessageToDashboardSide(data) {
            $('#textBoxText-' + this.id).val(data.value);
        }
        ;
    }
    exports.UiTextBoxNode = UiTextBoxNode;
    container_1.Container.registerNodeType("ui/text-box", UiTextBoxNode);
});
//# sourceMappingURL=text-box.js.map