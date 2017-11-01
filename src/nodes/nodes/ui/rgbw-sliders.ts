/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { UiNode } from "./ui-node";
import { Side, Container } from "../../container";
import Utils from "../../utils";


export class UiRgbwSlidersNode extends UiNode {


    constructor() {
        super("RGBW Sliders", "UiRgbwSlidersNode");

        this.descriprion = "";
        this.UPDATE_INPUTS_INTERVAL = 100;
        this.setState({ r: 0, g: 0, b: 0, w: 0 });

        this.addInput("output", "string");
        this.addOutput("output", "string");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server) {
            let state = this.getState();
            let hex = Utils.numsToRgbwHex([state.r, state.g, state.b, state.w]);
            this.setOutputData(0, hex);
        }
    }

    onGetMessageToServerSide(data) {
        console.log(data);
        if (data.state != null)
            this.setRGBW(data.state.r, data.state.g, data.state.b, data.state.w);
    };

    onInputUpdated() {
        let val = this.getInputData(0);
        this.setHex(val);
    };

    setHex(hex) {
        let rgbw = Utils.rgbwHexToNums(hex);
        this.setRGBW(rgbw[0], rgbw[1], rgbw[2], rgbw[3])
    }

    setRGBW(r, g, b, w) {
        let hex = Utils.numsToRgbwHex([r, g, b, w]);

        this.setOutputData(0, hex);
        this.sendIOValuesToEditor();
        this.isRecentlyActive = true;

        let state = this.getState();
        if (state.r != r || state.g != g || state.b != b || state.w != w)//prevent loop sending
            this.setState({ r, g, b, w });
    }
}

Container.registerNodeType("ui/rgbw-sliders", UiRgbwSlidersNode);
