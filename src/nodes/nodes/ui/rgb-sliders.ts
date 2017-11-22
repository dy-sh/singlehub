/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { UiNode } from "./ui-node";
import { Side, Container } from "../../container";
import Utils from "../../utils";


export class UiRgbSlidersNode extends UiNode {


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

        if (this.side == Side.server) {
            let state = this.getState();
            let hex = Utils.numsToRgbHex([state.r, state.g, state.b]);
            this.setOutputData(0, hex);
        }
    }

    onGetMessageToServerSide(data) {
        // console.log(data);
        if (data.state != null)
            this.setRGB(data.state.r, data.state.g, data.state.b);
    };

    onInputUpdated() {
        let val = this.getInputData(0);
        this.setHex(val);
    };

    setHex(hex) {
        try {
            let rgb = Utils.rgbHexToNums(hex);
            this.setRGB(rgb[0], rgb[1], rgb[2])
        } catch (e) {
            this.debugErr(e);
        }
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

Container.registerNodeType("ui/rgb-sliders", UiRgbSlidersNode);
