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
var UiVoiceYandexNode = (function (_super) {
    __extends(UiVoiceYandexNode, _super);
    function UiVoiceYandexNode() {
        _super.call(this, "Voice Yandex", template);
        this.playlist = [];
        this.descriprion = "";
        this.settings['api-key'] = { description: "Yandex SpeechKit Cloud Key", type: "string" };
        this.addInput("text", "string");
        this.addInput("play", "boolean");
    }
    UiVoiceYandexNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.dashboard) {
            this.audioSpeech = new Audio();
        }
    };
    UiVoiceYandexNode.prototype.onInputUpdated = function () {
        var text = this.getInputData(0);
        var play = this.getInputData(1) == true;
        this.sendMessageToDashboardSide({ text: text, play: play });
        this.isRecentlyActive = true;
    };
    ;
    UiVoiceYandexNode.prototype.onGetMessageToDashboardSide = function (data) {
        if (data.play) {
            this.playlist.push(data.text);
            if (this.audioSpeech.paused)
                this.playNextTrack();
        }
    };
    ;
    UiVoiceYandexNode.prototype.playNextTrack = function () {
        if (this.playlist.length == 0)
            return;
        var text = this.playlist.shift();
        var api_key = this.settings['api-key'].value;
        if (!api_key) {
            this.debugErr("Please, set api-key in node settings.");
            return;
        }
        var url = "https://tts.voicetech.yandex.net/generate?key=" + api_key + "&text=" + text;
        this.audioSpeech.src = url;
        this.audioSpeech.load();
        this.audioSpeech.play();
        //var msg = new SpeechSynthesisUtterance(text);
        //window.speechSynthesis.speak(msg);
    };
    return UiVoiceYandexNode;
}(ui_node_1.UiNode));
exports.UiVoiceYandexNode = UiVoiceYandexNode;
container_1.Container.registerNodeType("ui/voice-yandex", UiVoiceYandexNode);
