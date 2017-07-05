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



export class RgbNumbersToRgbwNode extends Node {
    constructor() {
        super();
        this.title = "Numbers to RGBW";
        this.descriprion = "This node converts four numbers to RGBW color. <br/>" +
            "For example: 255, 170, 0, 255 will be converted to \"#FFAA00FF\".";

        this.addInput("r", "number");
        this.addInput("g", "number");
        this.addInput("b", "number");
        this.addInput("w", "number");
        this.addOutput("rgbw", "string");
    }

    onInputUpdated() {
        var r = this.inputs[0].data;
        var g = this.inputs[1].data;
        var b = this.inputs[2].data;
        var w = this.inputs[3].data;

        if (r == null || g == null || b == null || w == null)
            return this.setOutputData(0, null);

        r = Utils.clamp(r, 0, 255);
        g = Utils.clamp(g, 0, 255);
        b = Utils.clamp(b, 0, 255);
        w = Utils.clamp(w, 0, 255);

        var rgbw = Utils.numsToRgbwHex([r, g, b, w]);
        this.setOutputData(0, rgbw);
    }
}
Container.registerNodeType("rgb/numbers-to-rgbw", RgbNumbersToRgbNode);




export class RgbRgbToNumbersNode extends Node {
    constructor() {
        super();
        this.title = "RGB to numbers";
        this.descriprion = "This node converts RGB color to three numbers. <br/>" +
            "For example: \"#FFAA00\" will be converted to 255, 170, 0. <br/>" +
            "Node takes color with a # sign at the beginning or without it.";

        this.addInput("rgb", "string");
        this.addOutput("r", "number");
        this.addOutput("g", "number");
        this.addOutput("b", "number");
    }

    onInputUpdated() {
        var rgb = this.inputs[0].data;

        if (rgb == null) {
            this.setOutputData(0, null);
            this.setOutputData(1, null);
            this.setOutputData(2, null);
            return;
        }

        var arr;
        try {
            arr = Utils.hex2num(rgb);
        }
        catch (e) {
            this.debugWarn("Can't convert \"" + rgb + "\" to numbers");
            arr = [null, null, null];
        }

        this.setOutputData(0, arr[0]);
        this.setOutputData(1, arr[1]);
        this.setOutputData(2, arr[2]);
    }
}
Container.registerNodeType("rgb/rgb-to-numbers", RgbRgbToNumbersNode);