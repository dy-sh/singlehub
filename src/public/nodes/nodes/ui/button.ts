/**
 * Created by Derwish (derwish.pro@gmail.com) on 26.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";


export class UiButtonNode extends UiNode {

    constructor() {
        super("Button", null, "UiButtonNode");

        this.descriprion = "";
        this.properties['value'] = false;

        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['value']);
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        this.properties['value'] = true;
        this.setOutputData(0, true);
        this.sendIOValuesToEditor();
    };

    onExecute() {
        if (this.properties['value'] == true) {
            this.properties['value'] = false;
            this.setOutputData(0, false);
        }
    }
}

Container.registerNodeType("ui/button", UiButtonNode);


