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
    </div>';
var UiAudioNode = (function (_super) {
    __extends(UiAudioNode, _super);
    function UiAudioNode() {
        _super.call(this, "Audio", template);
        this.descriprion = "";
        this.addInput("audio URL", "string");
        this.addInput("play", "boolean");
    }
    UiAudioNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.dashboard) {
            this.audio = new Audio();
        }
    };
    UiAudioNode.prototype.onInputUpdated = function () {
        var url = this.getInputData(0);
        var play = this.getInputData(1) == true;
        this.sendMessageToDashboardSide({ url: url, play: play });
        this.isRecentlyActive = true;
    };
    ;
    UiAudioNode.prototype.onGetMessageToDashboardSide = function (data) {
        if (!this.audio.paused)
            this.audio.pause();
        // if (data.url) {
        this.audio.src = data.url;
        this.audio.load();
        // }
        if (data.play)
            this.audio.play();
    };
    ;
    return UiAudioNode;
}(ui_node_1.UiNode));
exports.UiAudioNode = UiAudioNode;
container_1.Container.registerNodeType("ui/audio", UiAudioNode);
