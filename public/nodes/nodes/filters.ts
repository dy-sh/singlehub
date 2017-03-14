/**
 * Created by Derwish (derwish.pro@gmail.com) on 08.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


class FiltersOnlyFromRangeNode extends Node {
    constructor() {
        super();

        this.title = "Only from range";
        this.descriprion = "This node filters the input values. " +
            "It transmits the value only if it is in the range from Min to Max.";

        this.addInput("value", "number");
        this.addInput("min", "number");
        this.addInput("max", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let min = this.getInputData(1);
        let max = this.getInputData(2);

        if (val == null || min == null || max == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val >= min && val <= max)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-from-range", FiltersOnlyFromRangeNode);




class FiltersOnlyGreaterNode extends Node {
    constructor() {
        super();

        this.title = "Only greater";
        this.descriprion = "This node filters the input values. " +
            "It passes only those values that are greater than Treshold.";

        this.addInput("value", "number");
        this.addInput("treshold", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let treshold = this.getInputData(1);

        if (val == null || treshold == null) {
            this.setOutputData(0, null);
            return;
        }

        if (val > treshold)
            this.setOutputData(0, val);
    }
}
Container.registerNodeType("filters/only-greater", FiltersOnlyGreaterNode);
