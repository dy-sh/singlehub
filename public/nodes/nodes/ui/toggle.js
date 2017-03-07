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
        <button class="ui right floated small toggle button" id="button-{{id}}">\
            &nbsp <span id="nodeTitle-{{id}}"></span> &nbsp\
        </button>\
    </div>';
var UiToggleNode = (function (_super) {
    __extends(UiToggleNode, _super);
    function UiToggleNode() {
        _super.call(this, "Toggle", template);
        this.descriprion = "Toggle button";
        this.properties['value'] = false;
        this.addOutput("output", "boolean");
    }
    UiToggleNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.setOutputData(0, this.properties['value']);
        if (this.side == container_1.Side.dashboard) {
            var that_1 = this;
            $('#button-' + this.id).click(function () {
                that_1.sendMessageToServerSide('toggle');
            });
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiToggleNode.prototype.onGetMessageToServerSide = function (data) {
        this.isRecentlyActive = true;
        var val = !this.properties['value'];
        this.properties['value'] = val;
        this.setOutputData(0, val);
        this.sendMessageToDashboardSide({ value: val });
        this.sendIOValuesToEditor();
    };
    ;
    UiToggleNode.prototype.onGetMessageToDashboardSide = function (data) {
        if (data.value)
            $('#button-' + this.id).addClass("blue");
        else
            $('#button-' + this.id).removeClass("blue");
    };
    ;
    return UiToggleNode;
}(ui_node_1.UiNode));
exports.UiToggleNode = UiToggleNode;
container_1.Container.registerNodeType("ui/toggle", UiToggleNode);
