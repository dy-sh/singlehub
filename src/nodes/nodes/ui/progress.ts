/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { UiNode } from "./ui-node";
import { Side, Container } from "../../container";
import Utils from "../../utils";


export class UiProgressNode extends UiNode {

    constructor() {
        super("Progress", "UiProgressNode");
        this.descriprion = "";
        this.addInput("input", "number");
        this.UPDATE_INPUTS_INTERVAL = 100;
        this.setState(0);
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val > 100) val = 100;
        if (val < 0) val = 0;

        this.setState(val);
        this.isRecentlyActive = true;
    };
}

Container.registerNodeType("ui/progress", UiProgressNode);

