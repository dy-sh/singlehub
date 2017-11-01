/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { UiNode } from "./ui-node";
import { Side, Container } from "../../container";
import Utils from "../../utils";


export class UiRGBSlidersNode extends UiNode {


    constructor() {
        super("RGB Sliders", "UiRgbSlidersNode");

        this.descriprion = "";
        this.UPDATE_INPUTS_INTERVAL = 100;
        this.setState({ r: 0, g: 0, b: 0 });

        this.addInput("output", "string");
        this.addOutput("output", "string");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.getState().hex);
    }

    onGetMessageToServerSide(data) {
        console.log(data);
        if (data.state != null)
            this.setRGB(data.state.r, data.state.g, data.state.b);
    };

    onInputUpdated() {
        let val = this.getInputData(0);
        this.setHex(val);
    };

    setHex(hex) {
        let rgb = Utils.rgbHexToNums(hex);
        this.setRGB(rgb[0], rgb[1], rgb[2])
    }

    setRGB(r, g, b) {
        let hex = Utils.numsToRgbHex([r, g, b]);

        this.setOutputData(0, hex);
        this.sendIOValuesToEditor();
        this.isRecentlyActive = true;

        let state = this.getState();
        if (state.r != r || state.g != g || state.b != b)//prevent loop sending
            this.setState({ r, g, b });
    }
}

Container.registerNodeType("ui/rgb-sliders", UiRGBSlidersNode);
