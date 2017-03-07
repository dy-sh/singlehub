/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.17.
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
    </div>';
var UiVoiceChromeNode = (function (_super) {
    __extends(UiVoiceChromeNode, _super);
    function UiVoiceChromeNode() {
        _super.call(this, "Voice Chrome", template);
        this.descriprion = "";
        this.addInput("text", "string");
        this.addInput("play", "boolean");
    }
    UiVoiceChromeNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
    };
    UiVoiceChromeNode.prototype.onInputUpdated = function () {
        var text = this.getInputData(0);
        var play = this.getInputData(1) == true;
        this.sendMessageToDashboardSide({ text: text, play: play });
        this.isRecentlyActive = true;
    };
    ;
    UiVoiceChromeNode.prototype.onGetMessageToDashboardSide = function (data) {
        if (data.play) {
            var msg = new SpeechSynthesisUtterance(data.text);
            window.speechSynthesis.speak(msg);
        }
    };
    ;
    return UiVoiceChromeNode;
}(ui_node_1.UiNode));
exports.UiVoiceChromeNode = UiVoiceChromeNode;
container_1.Container.registerNodeType("ui/voice-chrome", UiVoiceChromeNode);
