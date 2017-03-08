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
        <div class="ui blue small progress" id="progressBar-{{id}}">\
            <div class="bar">\
                <div class="progress"></div>\
            </div>\
        </div>\
    </div>';
var UiProgressNode = (function (_super) {
    __extends(UiProgressNode, _super);
    function UiProgressNode() {
        _super.call(this, "Progress", template);
        this.UPDATE_INTERVAL = 100;
        this.dataUpdated = false;
        this.descriprion = "";
        this.properties['value'] = 0;
        this.addInput("input", "number");
    }
    UiProgressNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.startSendingToDashboard();
        if (this.side == container_1.Side.dashboard) {
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiProgressNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val > 100)
            val = 100;
        if (val < 0)
            val = 0;
        this.properties['value'] = val;
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };
    ;
    UiProgressNode.prototype.startSendingToDashboard = function () {
        var that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToDashboardSide({ value: that.properties['value'] });
            }
        }, this.UPDATE_INTERVAL);
    };
    UiProgressNode.prototype.onGetMessageToDashboardSide = function (data) {
        $('#progressBar-' + this.id).progress({
            percent: data.value,
            showActivity: false
        });
    };
    ;
    return UiProgressNode;
}(ui_node_1.UiNode));
exports.UiProgressNode = UiProgressNode;
container_1.Container.registerNodeType("ui/progress", UiProgressNode);
