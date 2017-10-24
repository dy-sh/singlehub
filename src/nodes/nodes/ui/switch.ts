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
        this.properties['state'] = false;

        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['state']);
    }

    onGetMessageToServerSide(data) {
        let state = data.state;

        console.log("onGetMessageToServerSide", state)

        this.isRecentlyActive = true;
        this.properties['state'] = state;
        this.setOutputData(0, state);
        this.sendMessageToDashboardSide({ state: state });
        this.updateDahboardElementState();
        this.sendIOValuesToEditor();
    };
}

Container.registerNodeType("ui/switch", UiSwitchNode);
