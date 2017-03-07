/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
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
    class UiAudioNode extends ui_node_1.UiNode {
        constructor() {
            super("Audio", template);
            this.descriprion = "";
            this.addInput("audio URL", "string");
            this.addInput("play", "boolean");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.dashboard) {
                this.audio = new Audio();
            }
        }
        onInputUpdated() {
            let url = this.getInputData(0);
            let play = this.getInputData(1) == true;
            this.sendMessageToDashboardSide({ url: url, play: play });
            this.isRecentlyActive = true;
        }
        ;
        onGetMessageToDashboardSide(data) {
            if (!this.audio.paused)
                this.audio.pause();
            // if (data.url) {
            this.audio.src = data.url;
            this.audio.load();
            // }
            if (data.play)
                this.audio.play();
        }
        ;
    }
    exports.UiAudioNode = UiAudioNode;
    container_1.Container.registerNodeType("ui/audio", UiAudioNode);
});
//# sourceMappingURL=audio.js.map