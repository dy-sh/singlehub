/**
 * Created by Derwish (derwish.pro@gmail.com) on 07.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


export class TickerNode extends Node {


    lastTime: number;

    constructor() {
        super();
        this.title = "Ticker";
        this.descriprion = "This node generates a sequence like 101010 (true|false)... with specified time interval. <br/>" +
            "You can set the time interval and activate the timer, " +
            "giving \"true\" to the input named \"Enable\". <br/>" +
            "If \"Generate False\" option is enabled in the settings of the node, " +
            "node will generate a sequence like 101010... " +
            "If disabled, the output will be 111111...";

        this.addInput("interval", "number");
        this.addInput("enable", "boolean");
        this.addOutput("tick", "boolean");


        this.settings["interval"] = {description: "Interval", value: 1000, type: "number"};
        this.settings["false"] = {description: "Generate False", value: true, type: "boolean"};

    }


    onExecute() {
        let enable = this.getInputData(1);
        if (enable==false)
            return;

        let now = Date.now();
        if (!this.lastTime)
            this.lastTime = now;

        let interval = this.getInputData(0);
        if (interval == null)
            interval = this.settings["interval"].value;

        let val = this.outputs[0].data;

        if (this.settings["false"].value) {
            if (val && now - this.lastTime >= interval / 2) {
                this.setOutputData(0, false);
                return;
            }
        }

        if (now - this.lastTime >= interval) {
            this.lastTime = now;
            this.setOutputData(0, true);
            return;
        }


    }
}
Container.registerNodeType("time/ticker", TickerNode);

