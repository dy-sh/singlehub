/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";



export class UiAudioNode extends Node {

    constructor() {
        super();

        this.descriprion = "";

        this.addInput("audio URL", "string");
        this.addInput("play", "boolean");
    }


    onInputUpdated() {
        let url = this.getInputData(0);
        let play = this.getInputData(1) == true;
        this.container.server_dashboard_socket.emit("uiAudioNode", { url, play });
        this.isRecentlyActive = true;
    };
}

Container.registerNodeType("ui/audio", UiAudioNode);

