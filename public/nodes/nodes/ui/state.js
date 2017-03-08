/**
 * Created by Derwish (derwish.pro@gmail.com) on 26.02.17.
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
        <div class="ui right floated basic disabled button nonbutton">\
            <i class="big blue toggle on icon" id="state-on-{{id}}" style="display:none"></i>\
            <i class="big toggle off icon" id="state-off-{{id}}" style="display:none"></i>\
            <i class="big red toggle off icon" id="state-null-{{id}}" style="display:none"></i>\
        </div>\
    </div>';
var UiStateNode = (function (_super) {
    __extends(UiStateNode, _super);
    function UiStateNode() {
        _super.call(this, "State", template);
        this.UPDATE_INTERVAL = 100;
        this.dataUpdated = false;
        this.descriprion = "Show value of input";
        this.properties['value'] = false;
        this.addInput("input");
    }
    UiStateNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.startSendingToDashboard();
        if (this.side == container_1.Side.dashboard) {
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiStateNode.prototype.onInputUpdated = function () {
        this.properties['value'] = this.getInputData(0) == true;
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };
    ;
    UiStateNode.prototype.startSendingToDashboard = function () {
        var that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToDashboardSide({ value: that.properties['value'] });
            }
        }, this.UPDATE_INTERVAL);
    };
    UiStateNode.prototype.onGetMessageToDashboardSide = function (data) {
        if (data.value == true) {
            $('#state-on-' + this.id).show();
            $('#state-off-' + this.id).hide();
            $('#state-null-' + this.id).hide();
        }
        else if (data.value == false) {
            $('#state-on-' + this.id).hide();
            $('#state-off-' + this.id).show();
            $('#state-null-' + this.id).hide();
        }
        else {
            $('#state-on-' + this.id).hide();
            $('#state-off-' + this.id).hide();
            $('#state-null-' + this.id).show();
        }
    };
    ;
    return UiStateNode;
}(ui_node_1.UiNode));
exports.UiStateNode = UiStateNode;
container_1.Container.registerNodeType("ui/state", UiStateNode);
