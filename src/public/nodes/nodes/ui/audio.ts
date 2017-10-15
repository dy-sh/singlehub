/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
    </div>';


export class UiAudioNode extends UiNode {

    audio: HTMLAudioElement;

    constructor() {
        super("Audio", "UiAudioNode");

        this.descriprion = "";

        this.addInput("audio URL", "string");
        this.addInput("play", "boolean");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.dashboard) {
            this.audio = new Audio();
        }
    }

    onInputUpdated() {
        let url = this.getInputData(0);
        let play = this.getInputData(1) == true;
        this.sendMessageToDashboardSide({ url: url, play: play })
        this.isRecentlyActive = true;
    };

    onGetMessageToDashboardSide(data) {
        if (!this.audio.paused)
            this.audio.pause();

        // if (data.url) {
        this.audio.src = data.url;
        this.audio.load();
        // }

        if (data.play)
            this.audio.play();
    };
}

Container.registerNodeType("ui/audio", UiAudioNode);

