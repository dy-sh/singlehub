/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


class AnyToTrueNode extends Node {
    val = 0;

    constructor() {
        super();

        this.title = "Any to true";
        this.descriprion = "This node sends \"true\" to the output, when anything comes to the input except null.<br/><br/>" +
            "In the settings of the node you can enable the option to send \"false\" immediately after \"true\".";

        this.addInput("value", "number");
        this.addOutput("true", "boolean");

        this.settings["false"] = {description: "Generate False", value: true, type: "boolean"};
    }

    onInputUpdated() {
        if(this.getInputData(0)==null)
            return;

        this.setOutputData(0, true);
    }

    onExecute(){
        if (this.settings["false"].value
            && this.outputs[0].data==true)
            this.setOutputData(0, false);
    }
}
Container.registerNodeType("operation/any-to-true", AnyToTrueNode);

