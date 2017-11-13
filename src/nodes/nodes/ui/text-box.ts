/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";


export class UiTextBoxNode extends UiNode {

    constructor() {
        super("TextBox", "UiTextBoxNode");

        this.descriprion = "";
        this.setState("");

        this.addInput("input", "boolean");
        this.addOutput("output", "string");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.getState());
    }



    onInputUpdated() {
        let val = this.getInputData(0);
        this.setState(val);
    };


}

Container.registerNodeType("ui/text-box", UiTextBoxNode);


