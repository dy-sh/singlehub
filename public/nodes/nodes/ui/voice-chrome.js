/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
    </div>';
    class UiVoiceChromeNode extends ui_node_1.UiNode {
        constructor() {
            super("Voice Chrome", template);
            this.descriprion = "";
            this.addInput("text", "string");
            this.addInput("play", "boolean");
        }
        onAdded() {
            super.onAdded();
        }
        onInputUpdated() {
            let text = this.getInputData(0);
            let play = this.getInputData(1) == true;
            this.sendMessageToDashboardSide({ text: text, play: play });
            this.isRecentlyActive = true;
        }
        ;
        onGetMessageToDashboardSide(data) {
            if (data.play) {
                let msg = new SpeechSynthesisUtterance(data.text);
                window.speechSynthesis.speak(msg);
            }
        }
        ;
    }
    exports.UiVoiceChromeNode = UiVoiceChromeNode;
    container_1.Container.registerNodeType("ui/voice-chrome", UiVoiceChromeNode);
});
//# sourceMappingURL=voice-chrome.js.map