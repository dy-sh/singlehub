/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";


export class UiLabelNode extends UiNode {

    constructor() {
        super("Label", "UiLabelNode");
        this.descriprion = "Show value of input";
        this.addInput("input");
        this.UPDATE_INPUTS_INTERVAL = 100;
    }

    onAdded() {
        super.onAdded();
    }

    onInputUpdated() {
        let state = Utils.formatAndTrimValue(this.getInputData(0));
        this.setState(state);

        this.isRecentlyActive = true;
    };
}

Container.registerNodeType("ui/label", UiLabelNode);



