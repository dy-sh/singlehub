/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { UiNode } from "./ui-node";
import { Side, Container } from "../../container";
import Utils from "../../utils";


export class UiSliderNode extends UiNode {

    constructor() {
        super("Slider", "UiSliderNode");

        this.descriprion = "";
        this.addInput("input", "number");
        this.addOutput("output", "number");
        this.UPDATE_INPUTS_INTERVAL = 100;
        this.setState(0);
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
        if (val > 100) val = 100;
        if (val < 0) val = 0;

        this.setOutputData(0, val);
        this.sendIOValuesToEditor();
        this.isRecentlyActive = true;

        if (this.getState() != val)//prevent loop sending
            this.setState(val);
    }
}

Container.registerNodeType("ui/slider", UiSliderNode);
