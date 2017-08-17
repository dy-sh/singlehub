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

declare let SpeechSynthesisUtterance;


export class UiVoiceChromeNode extends UiNode {

    constructor() {
        super("Voice Chrome", template);

        this.descriprion = "This is a UI node. It can generate speech from the incoming text. <br/>" +
            "As the TTS engine is used built-in Google Chrome TTS, " +
            "so this node will work in this browser only. <br/>" +
            "You'll hear the voice if you have opened the panel on the dashboard, " +
            "in which there is this node. <br>" +
            // "If pin Play is connected, then it will trigger the generation of the voice. " +
            // "If it is not connected, the message will be played as soon as the text has come to the Text input."

            this.addInput("text", "string");
        // this.addInput("[play]", "boolean");
    }


    onAdded() {
        super.onAdded();
    }

    onInputUpdated() {
        // if (this.getInputData(1) != false) {
        let text = this.getInputData(0);
        this.sendMessageToDashboardSide({ text: text })
        this.isRecentlyActive = true;
        // }
    };

    onGetMessageToDashboardSide(data) {
        let msg = new SpeechSynthesisUtterance(data.text);
        (<any>window).speechSynthesis.speak(msg);
    };
}

Container.registerNodeType("ui/voice-chrome", UiVoiceChromeNode);

