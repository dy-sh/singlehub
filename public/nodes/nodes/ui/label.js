/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../../utils");
var container_1 = require("../../container");
var ui_node_1 = require("./ui-node");
var template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic disabled button nonbutton">\
            <span class="ui blue basic label" id="labelValue-{{id}}"></span>\
        </div>\
    </div>';
var UiLabelNode = (function (_super) {
    __extends(UiLabelNode, _super);
    function UiLabelNode() {
        _super.call(this, "Label", template);
        this.UPDATE_INTERVAL = 100;
        this.dataUpdated = false;
        this.descriprion = "Show value of input";
        this.properties['value'] = '-';
        this.addInput("input");
    }
    UiLabelNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.startSendingToDashboard();
        if (this.side == container_1.Side.dashboard) {
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiLabelNode.prototype.onInputUpdated = function () {
        this.properties['value'] = utils_1.default.formatAndTrimValue(this.getInputData(0));
        if (this.properties['value'] == "")
            this.properties['value'] = "-";
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };
    ;
    UiLabelNode.prototype.startSendingToDashboard = function () {
        var that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToDashboardSide({ value: that.properties['value'] });
            }
        }, this.UPDATE_INTERVAL);
    };
    UiLabelNode.prototype.onGetMessageToDashboardSide = function (data) {
        $('#labelValue-' + this.id).html(data.value);
    };
    ;
    return UiLabelNode;
}(ui_node_1.UiNode));
exports.UiLabelNode = UiLabelNode;
container_1.Container.registerNodeType("ui/label", UiLabelNode);
