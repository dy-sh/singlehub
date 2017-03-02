/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../node";
import Utils from "../../utils";
import {Side, Container} from "../../container";
import {UiNode} from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic disabled button nonbutton">\
            <span class="ui blue basic label" id="labelValue-{{id}}"></span>\
        </div>\
    </div>';


export class UiLabelNode extends UiNode {
    UPDATE_INTERVAL = 100;

    dataUpdated = false;

    constructor() {
        super("Label", template);

        this.descriprion = "Show value of input";
        this.properties['value'] = '-';

        this.addInput("input");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.startSendingToDashboard();

        if (this.side == Side.dashboard) {
            this.onGetMessageToDashboardSide({value: this.properties['value']})
        }
    }

    onInputUpdated() {
        this.properties['value'] = Utils.formatAndTrimValue(this.getInputData(0));
        if (this.properties['value'] == "")
            this.properties['value'] = "-";
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };

    startSendingToDashboard() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToDashboardSide({value: that.properties['value']});
            }
        }, this.UPDATE_INTERVAL);
    }


    onGetMessageToDashboardSide(data) {
        $('#labelValue-' + this.id).html(data.value);
    };
}

Container.registerNodeType("ui/label", UiLabelNode);



