/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.17.
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


export class UiVoiceYandexNode extends UiNode {


    playlist = [];
    audioSpeech: HTMLAudioElement;

    constructor() {
        super("Voice Yandex", "UiVoiceYandexNode");

        this.descriprion = "";

        this.settings['api-key'] = { description: "Yandex SpeechKit Cloud Key", type: "string" }

        this.addInput("text", "string");
        this.addInput("play", "boolean");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.dashboard) {
            this.audioSpeech = new Audio();
        }
    }

    onInputUpdated() {
        let text = this.getInputData(0);
        let play = this.getInputData(1) == true;
        this.sendMessageToDashboardSide({ text: text, play: play })
        this.isRecentlyActive = true;
    };

    onGetMessageToDashboardSide(data) {
        if (data.play) {
            this.playlist.push(data.text);

            if (this.audioSpeech.paused)
                this.playNextTrack();
        }
    };

    playNextTrack() {
        if (this.playlist.length == 0)
            return;

        let text = this.playlist.shift();
        let api_key = this.settings['api-key'].value;

        if (!api_key) {
            this.debugErr("Please, set api-key in node settings.");
            return;
        }

        let url = "https://tts.voicetech.yandex.net/generate?key=" + api_key + "&text=" + text;

        this.audioSpeech.src = url;
        this.audioSpeech.load();
        this.audioSpeech.play();

        //var msg = new SpeechSynthesisUtterance(text);
        //window.speechSynthesis.speak(msg);
    }
}

Container.registerNodeType("ui/voice-yandex", UiVoiceYandexNode);

