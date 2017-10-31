/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { UiNode } from "./ui-node";
import { Side, Container } from "../../container";
import Utils from "../../utils";


export class UiLabelNode extends UiNode {

    constructor() {
        super("Label", "UiLabelNode");
        this.descriprion = "Show value of input";
        this.addInput("input");
        this.UPDATE_INPUTS_INTERVAL = 100;
    }

    onInputUpdated() {
        let state = Utils.formatAndTrimValue(this.getInputData(0));
        this.setState(state);
        this.isRecentlyActive = true;
    };
}

Container.registerNodeType("ui/label", UiLabelNode);



