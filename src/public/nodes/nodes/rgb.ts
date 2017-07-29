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
Container.registerNodeType("rgb/numbers-to-rgbw", RgbNumbersToRgbwNode);




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
            arr = Utils.rgbHexToNums(rgb);
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




export class RgbRgbwToNumbersNode extends Node {
    constructor() {
        super();
        this.title = "RGBW to numbers";
        this.descriprion = "This node converts RGBW color to four numbers. <br/>" +
            "For example: \"FFAA00FF\" will be converted to 255, 170, 0, 255. <br/>" +
            "Node takes color with a # sign at the beginning or without it.";

        this.addInput("rgbw", "string");
        this.addOutput("r", "number");
        this.addOutput("g", "number");
        this.addOutput("b", "number");
        this.addOutput("w", "number");
    }

    onInputUpdated() {
        var rgbw = this.inputs[0].data;

        if (rgbw == null) {
            this.setOutputData(0, null);
            this.setOutputData(1, null);
            this.setOutputData(2, null);
            this.setOutputData(3, null);
            return;
        }

        var arr;
        try {
            arr = Utils.rgbwHexToNums(rgbw);
        }
        catch (e) {
            this.debugWarn("Can't convert \"" + rgbw + "\" to numbers");
            arr = [null, null, null, null];
        }

        this.setOutputData(0, arr[0]);
        this.setOutputData(1, arr[1]);
        this.setOutputData(2, arr[2]);
        this.setOutputData(3, arr[3]);
    }
}
Container.registerNodeType("rgb/rgbw-to-numbers", RgbRgbwToNumbersNode);



export class RgbRandomRgbNode extends Node {
    constructor() {
        super();
        this.title = "Random RGB";
        this.descriprion = "This node generates random RGB color. <br/>" +
            "To generate color, send \"1\" to \"Generate\" input. <br/>" +
            "You can set the minimum and maximum color. <br/>" +
            "Default Min value is #000000, Max is #FFFFFF.";

        this.addInput("generate", "boolean");
        this.addInput("[min rgb]", "string");
        this.addInput("[max rgb]", "string");
        this.addOutput("rgb", "string");
    }

    onInputUpdated() {
        if (this.inputs[0].updated && this.inputs[0].data) {
            let min = this.inputs[1].data || "000000";
            let max = this.inputs[2].data || "FFFFFF";

            let minArr, maxArr, resArr: [number, number, number] = [0, 0, 0];
            try {
                minArr = Utils.rgbHexToNums(min);
            }
            catch (e) {
                this.debugWarn("Can't convert \"" + min + "\" to RGB");
                return this.setOutputData(0, null);
            }

            try {
                maxArr = Utils.rgbHexToNums(max);
            }
            catch (e) {
                this.debugWarn("Can't convert \"" + max + "\" to RGB");
                return this.setOutputData(0, null);
            }

            for (let i = 0; i < 3; i++) {
                resArr[i] = Utils.getRandomInt(minArr[i], maxArr[i]);
            }

            let rgb = Utils.numsToRgbHex(resArr);

            this.setOutputData(0, rgb);
        }
    }
}
Container.registerNodeType("rgb/random-rgb", RgbRandomRgbNode);





export class RgbRandomRgbwNode extends Node {
    constructor() {
        super();
        this.title = "Random RGBW";
        this.descriprion = "This node generates random RGBW color. <br/>" +
            "To generate color, send \"1\" to \"Generate\" input. <br/>" +
            "You can set the minimum and maximum color. <br/>" +
            "Default Min value is #00000000, Max is #FFFFFFFF.";

        this.addInput("generate", "boolean");
        this.addInput("[min rgbw]", "string");
        this.addInput("[max rgbw]", "string");
        this.addOutput("rgbw", "string");
    }

    onInputUpdated() {
        if (this.inputs[0].updated && this.inputs[0].data) {
            let min = this.inputs[1].data || "00000000";
            let max = this.inputs[2].data || "FFFFFFFF";

            let minArr, maxArr, resArr: [number, number, number, number] = [0, 0, 0, 0];
            try {
                minArr = Utils.rgbwHexToNums(min);
            }
            catch (e) {
                this.debugWarn("Can't convert \"" + min + "\" to RGBW");
                return this.setOutputData(0, null);
            }

            try {
                maxArr = Utils.rgbwHexToNums(max);
            }
            catch (e) {
                this.debugWarn("Can't convert \"" + max + "\" to RGBW");
                return this.setOutputData(0, null);
            }

            for (let i = 0; i < 4; i++) {
                resArr[i] = Utils.getRandomInt(minArr[i], maxArr[i]);
            }

            let rgbw = Utils.numsToRgbwHex(resArr);

            this.setOutputData(0, rgbw);
        }
    }
}
Container.registerNodeType("rgb/random-rgbw", RgbRandomRgbwNode);




export class RgbRgbRemapNode extends Node {
    constructor() {
        super();
        this.title = "RGB Remap";
        this.descriprion = "This node works the same way as Numbers/Remap, " +
            "but accepts and outputs RGB color. <br/>" +
            "Using this node, you can change the white color temperature (remap min 000000 - max AABBCC). " +
            "Or, for example, exclude red color (remap min 000000 - max 00FFFF).";


        this.addInput("rgb value", "string");
        this.addInput("rgb in-min", "string");
        this.addInput("rgb in-max", "string");
        this.addInput("rgb out-min", "string");
        this.addInput("rgb out-max", "string");
        this.addOutput("rgb", "string");
    }

    onInputUpdated() {
        {
            let val = this.getInputData(0);
            let inMin = this.getInputData(1);
            let inMax = this.getInputData(2);
            let outMin = this.getInputData(3);
            let outMax = this.getInputData(4);

            if (val == null || inMin == null || inMax == null || outMin == null || outMax == null)
                return this.setOutputData(0, null);

            let valArr, inMinArr, inMaxArr, outMinArr, outMaxArr, resArr
                : [number, number, number] = [0, 0, 0];

            try {
                valArr = Utils.rgbHexToNums(val);
                inMinArr = Utils.rgbHexToNums(inMin);
                inMaxArr = Utils.rgbHexToNums(inMax);
                outMinArr = Utils.rgbHexToNums(outMin);
                outMaxArr = Utils.rgbHexToNums(outMax);

                for (let i = 0; i < 3; i++) {
                    resArr[i] = Utils.remap(valArr[i], inMinArr[i], inMaxArr[i], outMinArr[i], outMaxArr[i]);
                }

                let rgb = Utils.numsToRgbHex(resArr);

                this.setOutputData(0, rgb);
            }
            catch (e) {
                this.debugWarn("Can't convert input value to RGB");
                return this.setOutputData(0, null);
            }
        }
    }
}
Container.registerNodeType("rgb/rgb-remap", RgbRgbRemapNode);



export class RgbRgbwRemapNode extends Node {
    constructor() {
        super();
        this.title = "RGBW Remap";
        this.descriprion = "This node works the same way as Numbers/Remap, " +
            "but accepts and outputs RGBW color. <br/>" +
            "Using this node, you can change the white color temperature (remap min 00000000 - max AABBCCFF). " +
            "Or, for example, exclude red color (remap min 00000000 - max 00FFFFFF).";


        this.addInput("rgbw value", "string");
        this.addInput("rgbw in-min", "string");
        this.addInput("rgbw in-max", "string");
        this.addInput("rgbw out-min", "string");
        this.addInput("rgbw out-max", "string");
        this.addOutput("rgbw", "string");
    }

    onInputUpdated() {
        {
            let val = this.getInputData(0);
            let inMin = this.getInputData(1);
            let inMax = this.getInputData(2);
            let outMin = this.getInputData(3);
            let outMax = this.getInputData(4);

            if (val == null || inMin == null || inMax == null || outMin == null || outMax == null)
                return this.setOutputData(0, null);

            let valArr, inMinArr, inMaxArr, outMinArr, outMaxArr, resArr
                : [number, number, number, number] = [0, 0, 0, 0];

            try {
                valArr = Utils.rgbwHexToNums(val);
                inMinArr = Utils.rgbwHexToNums(inMin);
                inMaxArr = Utils.rgbwHexToNums(inMax);
                outMinArr = Utils.rgbwHexToNums(outMin);
                outMaxArr = Utils.rgbwHexToNums(outMax);

                for (let i = 0; i < 4; i++) {
                    resArr[i] = Utils.remap(valArr[i], inMinArr[i], inMaxArr[i], outMinArr[i], outMaxArr[i]);
                }

                let rgb = Utils.numsToRgbwHex(resArr);

                this.setOutputData(0, rgb);
            }
            catch (e) {
                this.debugWarn("Can't convert input value to RGBW");
                return this.setOutputData(0, null);
            }
        }
    }
}
Container.registerNodeType("rgb/rgbw-remap", RgbRgbwRemapNode);



export class RgbCrossfadeRgbNode extends Node {
    constructor() {
        super();
        this.title = "Crossfade RGB";
        this.descriprion = "This node makes the crossfade between two RGB colors. <br/>" +
            "\"Crossfade\" input takes a value from 0 to 100. <br/>" +
            "If Crossfade is 0, the output will be equal to A. <br/>" +
            "If Crossfade is 100, then the output is equal to B. <br/>" +
            "The intermediate value between 0 and 100 will give " +
            "intermediate number between A and B. <br/>" +
            "Default A value is #000000, B is #FFFFFF.";

        this.addInput("crossfade", "number");
        this.addInput("[a]", "string");
        this.addInput("[b]", "string");
        this.addOutput("rgb", "string");
    }

    onInputUpdated() {
        {
            let val = this.getInputData(0);
            let a = this.getInputData(1) || "000000";
            let b = this.getInputData(2) || "FFFFFF";


            if (val == null)
                return this.setOutputData(0, null);

            let aArr, bArr, resArr
                : [number, number, number] = [0, 0, 0];

            try {
                val = Utils.clamp(val, 0, 100);
                aArr = Utils.rgbHexToNums(a);
                bArr = Utils.rgbHexToNums(b);

                for (let i = 0; i < 3; i++) {
                    resArr[i] = Utils.remap(val, 0, 100, aArr[i], bArr[i]);
                }

                let rgb = Utils.numsToRgbHex(resArr);

                this.setOutputData(0, rgb);
            }
            catch (e) {
                this.debugWarn("Can't convert input value to RGB");
                return this.setOutputData(0, null);
            }
        }
    }
}
Container.registerNodeType("rgb/crossfade-rgb", RgbCrossfadeRgbNode);




export class RgbCrossfadeRgbwNode extends Node {
    constructor() {
        super();
        this.title = "Crossfade RGBW";
        this.descriprion = "This node makes the crossfade between two RGBW colors. <br/>" +
            "\"Crossfade\" input takes a value from 0 to 100. <br/>" +
            "If Crossfade is 0, the output will be equal to A. <br/>" +
            "If Crossfade is 100, then the output is equal to B. <br/>" +
            "The intermediate value between 0 and 100 will give " +
            "intermediate number between A and B. <br/>" +
            "Default A value is #00000000, B is #FFFFFFFF.";

        this.addInput("crossfade", "number");
        this.addInput("[a]", "string");
        this.addInput("[b]", "string");
        this.addOutput("rgbw", "string");
    }

    onInputUpdated() {
        {
            let val = this.getInputData(0);
            let a = this.getInputData(1) || "00000000";
            let b = this.getInputData(2) || "FFFFFFFF";


            if (val == null)
                return this.setOutputData(0, null);

            let aArr, bArr, resArr
                : [number, number, number, number] = [0, 0, 0, 0];

            try {
                val = Utils.clamp(val, 0, 100);
                aArr = Utils.rgbwHexToNums(a);
                bArr = Utils.rgbwHexToNums(b);

                for (let i = 0; i < 4; i++) {
                    resArr[i] = Utils.remap(val, 0, 100, aArr[i], bArr[i]);
                }

                let rgbw = Utils.numsToRgbwHex(resArr);

                this.setOutputData(0, rgbw);
            }
            catch (e) {
                this.debugWarn("Can't convert input value to RGBW");
                return this.setOutputData(0, null);
            }
        }
    }
}
Container.registerNodeType("rgb/crossfade-rgbw", RgbCrossfadeRgbwNode);




export class RgbFadeRgbNode extends Node {
    startTime: number;
    enabled = false;

    constructor() {
        super();
        this.title = "Fade RGB";
        this.descriprion = "This node makes a smooth transition from one RGB color to another. <br/>" +
            "You can specify the time interval for which color must change. <br/>" +
            "The output is named \"Enabled\" sends \"1\" " +
            "when the node is in the active state (makes the transition). <br/>" +
            "In the settings of the node you can increase the refresh rate " +
            "to make the transition more smoother. " +
            "Or, reduce the refresh rate to reduce CPU load and preven output flood.<br/>" +
            "Default From value is #000000, To is #FFFFFF, Interval is 1000.";

        this.addInput("[from rgb]", "string");
        this.addInput("[to rgb]", "string");
        this.addInput("[interval]", "number");
        this.addInput("start/stop", "boolean");

        this.addOutput("rgb");
        this.addOutput("enabled", "boolean");

        this.setOutputData(1, false);

        this.settings["update-interval"] = { description: "Output Update Interval", type: "number", value: 50 };
        this.settings["reset-on-stop"] = { description: "Reset on Stop", type: "boolean", value: false };

    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onSettingsChanged() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[3].updated) {
            this.enabled = this.inputs[3].data;
            this.setOutputData(1, this.enabled);
            //start
            if (this.enabled) {
                this.setOutputData(0, this.inputs[0].data)
                this.startTime = Date.now();
                this.executeLastTime = 0;
            }
            else {
                if (this.settings["reset-on-stop"].value)
                    this.setOutputData(0, this.getInputData(0))
            }
        }
    }

    onExecute() {
        if (!this.enabled)
            return;

        let from = this.getInputData(0) || "#000000";
        let to = this.getInputData(1) || "#FFFFFF";
        let interval = this.getInputData(2) || 1000;

        let elapsed = Date.now() - this.startTime;

        if (elapsed >= interval) {
            this.setOutputData(0, to);
            this.setOutputData(1, false);
            this.enabled = false;
        } else {

            let aArr, bArr, resArr
                : [number, number, number] = [0, 0, 0];

            try {
                aArr = Utils.rgbHexToNums(from);
                bArr = Utils.rgbHexToNums(to);

                for (let i = 0; i < 3; i++) {
                    resArr[i] = Utils.remap(this.startTime + elapsed, this.startTime, this.startTime + interval, aArr[i], bArr[i]);
                }

                let res = Utils.numsToRgbHex(resArr);

                this.setOutputData(0, res);
            }
            catch (e) {
                this.debugWarn("Can't convert input value to RGB");
                return this.setOutputData(0, null);
            }
        }
    }
}
Container.registerNodeType("rgb/fade-rgb", RgbFadeRgbNode);




export class RgbFadeRgbwNode extends Node {
    startTime: number;
    enabled = false;

    constructor() {
        super();
        this.title = "Fade RGBW";
        this.descriprion = "This node makes a smooth transition from one RGWB color to another. <br/>" +
            "You can specify the time interval for which color must change. <br/>" +
            "The output is named \"Enabled\" sends \"1\" " +
            "when the node is in the active state (makes the transition). <br/>" +
            "In the settings of the node you can increase the refresh rate " +
            "to make the transition more smoother. " +
            "Or, reduce the refresh rate to reduce CPU load and preven output flood.<br/>" +
            "Default From value is #00000000, To is #FFFFFFFF, Interval is 1000.";

        this.addInput("[from rgbw]", "string");
        this.addInput("[to rgbw]", "string");
        this.addInput("[interval]", "number");
        this.addInput("start/stop", "boolean");

        this.addOutput("rgbw");
        this.addOutput("enabled", "boolean");

        this.setOutputData(1, false);

        this.settings["update-interval"] = { description: "Output Update Interval", type: "number", value: 50 };
        this.settings["reset-on-stop"] = { description: "Reset on Stop", type: "boolean", value: false };

    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onSettingsChanged() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[3].updated) {
            this.enabled = this.inputs[3].data;
            this.setOutputData(1, this.enabled);
            //start
            if (this.enabled) {
                this.setOutputData(0, this.inputs[0].data)
                this.startTime = Date.now();
                this.executeLastTime = 0;
            }
            else {
                if (this.settings["reset-on-stop"].value)
                    this.setOutputData(0, this.getInputData(0))
            }
        }
    }

    onExecute() {
        if (!this.enabled)
            return;

        let from = this.getInputData(0) || "#00000000";
        let to = this.getInputData(1) || "#FFFFFFFF";
        let interval = this.getInputData(2) || 1000;

        let elapsed = Date.now() - this.startTime;

        if (elapsed >= interval) {
            this.setOutputData(0, to);
            this.setOutputData(1, false);
            this.enabled = false;
        } else {

            let aArr, bArr, resArr
                : [number, number, number, number] = [0, 0, 0, 0];

            try {
                aArr = Utils.rgbHexToNums(from);
                bArr = Utils.rgbHexToNums(to);

                for (let i = 0; i < 4; i++) {
                    resArr[i] = Utils.remap(this.startTime + elapsed, this.startTime, this.startTime + interval, aArr[i], bArr[i]);
                }

                let res = Utils.numsToRgbHex(resArr);

                this.setOutputData(0, res);
            }
            catch (e) {
                this.debugWarn("Can't convert input value to RGBW");
                return this.setOutputData(0, null);
            }
        }
    }
}
Container.registerNodeType("rgb/fade-rgbw", RgbFadeRgbwNode);





export class RgbSmoothRgbNode extends Node {
    startTime: number;
    enabled = false;
    from: string;
    to: string;

    constructor() {
        super();
        this.title = "Smooth RGB";
        this.descriprion = "This node makes a smooth transition of the RGB color. <br/>" +
            "It avoids abrupt changes of the color on the output. <br/><br/>" +

            "The input named \"Interval\" specifies the time " +
            "for which the color should change completely. <br/><br/>" +

            "The output is named \"Enabled\" sends \"1\" " +
            "when the node is in the active state (makes the transition). <br/><br/>" +

            "In the settings of the node you can increase the refresh rate " +
            "to make the transition more smoother. " +
            "Or, reduce the refresh rate to reduce CPU load.<br/><br/>" +

            "Default  Interval is 1000.";

        this.addInput("rgb", "string");
        this.addInput("[interval]", "number");

        this.addOutput("rgb", "string");
        this.addOutput("enabled", "boolean");

        this.setOutputData(1, false);

        this.settings["update-interval"] = { description: "Output Update Interval", type: "number", value: 50 };
        this.settings["start-value"] = { description: "Default value at start", type: "string", value: "#000000" };
        this.settings["stop-on-disc"] = { description: "Stop when input color is null (disconnected)", type: "boolean", value: false };
        this.settings["null-on-disc"] = { description: "Send null when input color is null (disconnected)", type: "boolean", value: false };
    }

    onAdded() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onSettingsChanged() {
        this.EXECUTE_INTERVAL = this.settings["update-interval"].value;
        this.UPDATE_INPUTS_INTERVAL = this.EXECUTE_INTERVAL;
    }

    onInputUpdated() {
        if (this.inputs[0].updated) {

            if (this.inputs[0].data != null) {
                this.start();
            }
            else {
                if (this.settings["stop-on-disc"].value)
                    this.stop();

                if (this.settings["null-on-disc"].value)
                    this.setOutputData(0, null);
            }
        }
        else {

        }
    }


    start() {
        this.to = this.inputs[0].data;
        if (this.to.charAt(0) != "#") this.to = "#" + this.to;
        this.from = this.outputs[0].data || this.settings["start-value"].value || "#000000";
        this.startTime = Date.now();
        this.executeLastTime = 0;
        this.setOutputData(1, true);
        this.enabled = true;
    }

    stop() {
        this.setOutputData(1, false);
        this.enabled = false;
    }

    onExecute() {
        if (!this.enabled)
            return;

        let interval = this.getInputData(1) || 1000;

        let elapsed = Date.now() - this.startTime;
        console.log(elapsed)
        if (elapsed >= interval) {
            this.setOutputData(0, this.to);
            this.stop();
            return;
        }

        let aArr, bArr, resArr
            : [number, number, number] = [0, 0, 0];

        try {
            aArr = Utils.rgbHexToNums(this.from);
            bArr = Utils.rgbHexToNums(this.to);

            for (let i = 0; i < 3; i++) {
                resArr[i] = Utils.remap(this.startTime + elapsed, this.startTime, this.startTime + interval, aArr[i], bArr[i]);
            }

            let res = Utils.numsToRgbHex(resArr);

            this.setOutputData(0, res);
        }
        catch (e) {
            this.debugWarn("Can't convert input value to RGB");
            this.stop();
            return this.setOutputData(0, null);
        }
    }
}
Container.registerNodeType("rgb/smooth-rgb", RgbSmoothRgbNode);


