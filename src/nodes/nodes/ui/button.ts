/**
 * Created by Derwish (derwish.pro@gmail.com) on 26.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";


export class UiButtonNode extends UiNode {

    constructor() {
        super("Button", "UiButtonNode");
        this.descriprion = "";

        this.addOutput("output", "boolean");
        this.settings["button-text"] = { description: "Button Text", value: "ON", type: "string" };
        this.setState({ buttonText: "ON" });
        // this.contextMenu["configure"] = { title: "Configure", onClick: this.onConfigureClick }
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, false);
    }

    onAfterSettingsChange(oldSettings) {
        if (this.side == Side.server) {
            if (this.settings["button-text"].value != oldSettings["button-text"].value) {
                this.setState({ buttonText: this.settings["button-text"].value });
            }
        }
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        this.setOutputData(0, true);
        this.sendIOValuesToEditor();
    };

    onExecute() {
        if (this.outputs[0].data == true) {
            this.setOutputData(0, false);
        }
    }


    onConfigureClick() {
        (<any>window).vueEditor.$refs.UiButtonSettings[0].show(this);
    }
}

Container.registerNodeType("ui/button", UiButtonNode);


