/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui blue small progress" id="progressBar-{{id}}">\
            <div class="bar">\
                <div class="progress"></div>\
            </div>\
        </div>\
    </div>';


export class UiProgressNode extends UiNode {
    UPDATE_INTERVAL = 100;

    dataUpdated = false;

    constructor() {
        super("Progress", "UiProgressNode");

        this.descriprion = "";
        this.properties['value'] = 0;

        this.addInput("input", "number");
    }


    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.startSendingToDashboard();

        if (this.side == Side.dashboard) {
            this.onGetMessageToDashboardSide({ value: this.properties['value'] })
        }
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val > 100) val = 100;
        if (val < 0) val = 0;

        this.properties['value'] = val;
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };

    startSendingToDashboard() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToDashboard({ value: that.properties['value'] });
            }
        }, this.UPDATE_INTERVAL);
    }


    onGetMessageToDashboardSide(data) {
        (<any>$('#progressBar-' + this.id)).progress({
            percent: data.value,
            showActivity: false
        });
    };
}

Container.registerNodeType("ui/progress", UiProgressNode);

