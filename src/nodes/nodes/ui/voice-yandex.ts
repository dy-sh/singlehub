/**
 * Created by Derwish (derwish.pro@gmail.com) on 03.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";



export class UiVoiceYandexNode extends Node {


    constructor() {
        super();

        this.descriprion = "";
        this.settings['api-key'] = { description: "Yandex SpeechKit Cloud Key", type: "string" }
        this.addInput("text", "string");
    }


    onInputUpdated() {
        let text = this.getInputData(0);
        if (text != null && text != "")
            this.container.server_dashboard_socket.emit("uiVoiceYandexNode", { text: text, key: this.settings['api-key'].value });
        this.isRecentlyActive = true;
    };
}

Container.registerNodeType("ui/voice-yandex", UiVoiceYandexNode);

