/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("../../container");
var ui_node_1 = require("./ui-node");
var template = '<div class="ui attached clearing segment" id="node-{{id}}">\
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
var UiTextBoxNode = (function (_super) {
    __extends(UiTextBoxNode, _super);
    function UiTextBoxNode() {
        _super.call(this, "TextBox", template);
        this.descriprion = "";
        this.properties['value'] = null;
        this.addOutput("output", "string");
    }
    UiTextBoxNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.setOutputData(0, this.properties['value']);
        if (this.side == container_1.Side.dashboard) {
            var that_1 = this;
            $('#textBoxSend-' + this.id).click(function () {
                var value = $('#textBoxText-' + that_1.id).val();
                that_1.sendMessageToServerSide({ value: value });
            });
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiTextBoxNode.prototype.onGetMessageToServerSide = function (data) {
        this.isRecentlyActive = true;
        if (data.value == "")
            data.value = null;
        this.properties['value'] = data.value;
        this.setOutputData(0, data.value);
        this.sendMessageToDashboardSide(data);
        this.sendIOValuesToEditor();
    };
    ;
    UiTextBoxNode.prototype.onGetMessageToDashboardSide = function (data) {
        $('#textBoxText-' + this.id).val(data.value);
    };
    ;
    return UiTextBoxNode;
}(ui_node_1.UiNode));
exports.UiTextBoxNode = UiTextBoxNode;
container_1.Container.registerNodeType("ui/text-box", UiTextBoxNode);
