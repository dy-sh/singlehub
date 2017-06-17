/**
 * Created by Derwish (derwish.pro@gmail.com) on 18.06.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../node";
import { Container, Side } from "../container";
import Utils from "../utils";


export class SystemBeepNode extends Node {

    constructor() {
        super();
        this.title = "Beep";
        this.descriprion = "This node plays a default system sound on the server (not in the browser).";

        this.addInput("start", "boolean");
    }

    onInputUpdated() {
        if (this.getInputData(0) == true)
            process.stderr.write('\x07');
        // console.log('\u0007');
    };
}
Container.registerNodeType("system/beep", SystemBeepNode);

