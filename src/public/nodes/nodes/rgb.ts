/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../node";
import { Container } from "../container";
import Utils from "../utils";


export class RgbNumbersToRgbNode extends Node {
    constructor() {
        super();
        this.title = "Numbers to RGB";
        this.descriprion = "This node converts three numbers to RGB color. <br/>" +
            "For example: 255, 170, 0 will be converted to \"#FFAA00\".";

        this.addInput("r", "number");
        this.addInput("g", "number");
        this.addInput("b", "number");
        this.addOutput("rgb", "string");
    }

    onInputUpdated() {
        var r = this.inputs[0].data;
        var g = this.inputs[1].data;
        var b = this.inputs[2].data;

        if (r == null || g == null || b == null)
            return this.setOutputData(0, null);

        r = Utils.clamp(r, 0, 255);
        g = Utils.clamp(g, 0, 255);
        b = Utils.clamp(b, 0, 255);

        var rgb = Utils.numsToRgbHex([r, g, b]);
        this.setOutputData(0, rgb);
    }
}
Container.registerNodeType("rgb/numbers-to-rgb", RgbNumbersToRgbNode);
