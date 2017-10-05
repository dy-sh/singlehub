/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Container, Side } from "../../container";
import { UiNode } from "./ui-node";

export class UiSwitchNode extends UiNode {

    constructor() {
        super("Switch", "UiSwitchNode");

        this.descriprion = "";
        this.properties['value'] = false;

        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['value']);
    }

    onGetMessageToServerSide(value) {
        console.log("onGetMessageToServerSide", value)
        this.isRecentlyActive = true;
        this.properties['value'] = value;
        this.setOutputData(0, value);
        this.sendMessageToDashboard(value);
        this.updateDahboardElementState();
        this.sendIOValuesToEditor();
    };
}

Container.registerNodeType("ui/switch", UiSwitchNode);
