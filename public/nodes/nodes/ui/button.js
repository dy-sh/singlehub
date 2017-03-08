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
        <button class="ui right floated small button" id="button-{{id}}">\
            &nbsp <span id="nodeTitle-{{id}}"></span> &nbsp\
        </button>\
    </div>';
var UiButtonNode = (function (_super) {
    __extends(UiButtonNode, _super);
    function UiButtonNode() {
        _super.call(this, "Button", template);
        this.descriprion = "";
        this.properties['value'] = false;
        this.addOutput("output", "boolean");
    }
    UiButtonNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.setOutputData(0, this.properties['value']);
        if (this.side == container_1.Side.dashboard) {
            var that_1 = this;
            $('#button-' + this.id).click(function () {
                that_1.sendMessageToServerSide('click');
            });
        }
    };
    UiButtonNode.prototype.onGetMessageToServerSide = function (data) {
        this.isRecentlyActive = true;
        this.properties['value'] = true;
        this.setOutputData(0, true);
        this.sendIOValuesToEditor();
    };
    ;
    UiButtonNode.prototype.onExecute = function () {
        if (this.properties['value'] == true) {
            this.properties['value'] = false;
            this.setOutputData(0, false);
        }
    };
    return UiButtonNode;
}(ui_node_1.UiNode));
exports.UiButtonNode = UiButtonNode;
container_1.Container.registerNodeType("ui/button", UiButtonNode);
