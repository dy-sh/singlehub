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
var template = '  <div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic  button nonbutton">\
            <label class="switch">\
            <input type="checkbox" class="switch-input" id="switch-{{id}}">\
            <span class="switch-label" data-on="On" data-off="Off"></span>\
            <span class="switch-handle"></span>\
            </label>\
        </div>\
    </div>';
var UiSwitchNode = (function (_super) {
    __extends(UiSwitchNode, _super);
    function UiSwitchNode() {
        _super.call(this, "Switch", template);
        this.descriprion = "";
        this.properties['value'] = false;
        this.addOutput("output", "boolean");
    }
    UiSwitchNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.setOutputData(0, this.properties['value']);
        if (this.side == container_1.Side.dashboard) {
            var that_1 = this;
            $('#switch-' + this.id).click(function () {
                that_1.sendMessageToServerSide('toggle');
            });
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiSwitchNode.prototype.onGetMessageToServerSide = function (data) {
        this.isRecentlyActive = true;
        var val = !this.properties['value'];
        this.properties['value'] = val;
        this.setOutputData(0, val);
        this.sendMessageToDashboardSide({ value: val });
        this.sendIOValuesToEditor();
    };
    ;
    UiSwitchNode.prototype.onGetMessageToDashboardSide = function (data) {
        $('#switch-' + this.id).prop('checked', data.value == true);
    };
    ;
    return UiSwitchNode;
}(ui_node_1.UiNode));
exports.UiSwitchNode = UiSwitchNode;
container_1.Container.registerNodeType("ui/switch", UiSwitchNode);
