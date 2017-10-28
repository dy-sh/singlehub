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
        this.setState(false);

        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.getState());
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        this.setOutputData(0, data.state);
        this.sendIOValuesToEditor();
        this.setState(data.state);
    };
}

Container.registerNodeType("ui/switch", UiSwitchNode);
