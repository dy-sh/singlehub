/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Nodes} from "../../nodes";
import {Node} from "../../node";
import Utils from "../../utils";


//Watch a value in the editor
export class WatchNode extends Node {
    UPDATE_INTERVAL: number;

    lastData: any;
    dataUpdated = false;

    constructor() {
        super();

        this.UPDATE_INTERVAL = 300;


        this.title = "Label";
        this.descriprion = "Show value of input";
        this.size = [60, 20];
        this.addInput("input");
        this.startSending();
    }

    startSending() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToDashboardSide({value: that.lastData});
            }
        }, this.UPDATE_INTERVAL);
    }

    onInputUpdated = function () {
        this.lastData = this.getInputData(0);
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };

    onGetMessageFromBackSide = function (data) {
        this.lastData = data.value;
        this.showValue(data.value);
    };

    showValue(value: any) {
        //show the current value
        let val = Utils.formatAndTrimValue(value);

        console.log("!!!!" + val);

        this.setDirtyCanvas(true, false);
    }
}
Nodes.registerNodeType("ui/label", WatchNode);



