/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../node";
import Utils from "../../utils";
import {Side, Container} from "../../container";
import {UiNode} from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
    </div>';

declare let SpeechSynthesisUtterance;


export class UiVoiceChromeNode extends UiNode {

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
        this.sendMessageToDashboardSide({text: text, play: play})
        this.isRecentlyActive = true;
    };

    onGetMessageToDashboardSide(data) {
        if (data.play) {
            let msg = new SpeechSynthesisUtterance(data.text);
            (<any>window).speechSynthesis.speak(msg);
        }
    };
}

Container.registerNodeType("ui/voice-chrome", UiVoiceChromeNode);

