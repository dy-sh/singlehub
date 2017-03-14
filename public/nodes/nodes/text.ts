/**
 * Created by Derwish (derwish.pro@gmail.com) on 08.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


class TextStringLengthNode extends Node {
    constructor() {
        super();

        this.title = "String length";
        this.descriprion = "This node counts the number of characters in the given text string.";

        this.addInput("text", "string");
        this.addOutput("length", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, val.length);
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("text/string-length", TextStringLengthNode);

