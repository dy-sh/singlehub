/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


class AndNode extends Node {
    constructor() {
        super();

        this.title = "AND";
        this.descriprion = "This node performs a logical \"AND\" operation. ";

        this.addInput("a", "boolean");
        this.addInput("b", "boolean");
        this.addOutput("a && b", "boolean");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);

        if (a != null && b != null)
            this.setOutputData(0, a && b);
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("compare/and", AndNode);




class OrNode extends Node {
    constructor() {
        super();

        this.title = "OR";
        this.descriprion = "This node performs a logical \"OR\" operation. ";

        this.addInput("a", "boolean");
        this.addInput("b", "boolean");
        this.addOutput("a || b", "boolean");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);

        if (a != null && b != null)
            this.setOutputData(0, a || b);
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("compare/or", OrNode);

