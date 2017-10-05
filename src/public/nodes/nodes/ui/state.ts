/**
 * Created by Derwish (derwish.pro@gmail.com) on 26.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Node } from "../../node";
import Utils from "../../utils";
import { Side, Container } from "../../container";
import { UiNode } from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic disabled button nonbutton">\
            <i class="big blue toggle on icon" id="state-on-{{id}}" style="display:none"></i>\
            <i class="big toggle off icon" id="state-off-{{id}}" style="display:none"></i>\
            <i class="big red toggle off icon" id="state-null-{{id}}" style="display:none"></i>\
        </div>\
    </div>';


export class UiStateNode extends UiNode {
    UPDATE_INTERVAL = 100;

    dataUpdated = false;

    constructor() {
        super("State", "UiStateNode");

        this.descriprion = "Show value of input";
        this.properties['value'] = false;

        this.addInput("input");
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
        this.properties['value'] = this.getInputData(0) == true;
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
        if (data.value == true) {
            $('#state-on-' + this.id).show();
            $('#state-off-' + this.id).hide();
            $('#state-null-' + this.id).hide();
        }
        else if (data.value == false) {
            $('#state-on-' + this.id).hide();
            $('#state-off-' + this.id).show();
            $('#state-null-' + this.id).hide();
        } else {//undefined
            $('#state-on-' + this.id).hide();
            $('#state-off-' + this.id).hide();
            $('#state-null-' + this.id).show();
        }
    };
}

Container.registerNodeType("ui/state", UiStateNode);
