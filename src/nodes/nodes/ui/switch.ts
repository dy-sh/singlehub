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

        this.addInput("input", "boolean");
        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.getState());
    }

    onGetMessageToServerSide(data) {
        this.setValue(data.state);
    };

    onInputUpdated() {
        let val = this.getInputData(0);
        this.setValue(val);
    };

    setValue(val) {
        this.setOutputData(0, val);
        this.sendIOValuesToEditor();
        this.isRecentlyActive = true;

        if (this.getState() != val)//prevent loop sending
            this.setState(val);
    }
}

Container.registerNodeType("ui/switch", UiSwitchNode);
