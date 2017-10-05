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
        <button class="ui right floated small toggle button" id="button-{{id}}">\
            &nbsp <span id="nodeTitle-{{id}}"></span> &nbsp\
        </button>\
    </div>';


export class UiToggleNode extends UiNode {

    constructor() {
        super("Toggle", "UiToggleNode");

        this.descriprion = "Toggle button";
        this.properties['value'] = false;

        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['value']);

        if (this.side == Side.dashboard) {
            let that = this;
            $('#button-' + this.id).click(function () {
                that.sendMessageToServerSide('toggle');
            });

            this.onGetMessageToDashboardSide({ value: this.properties['value'] })
        }
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        let val = !this.properties['value'];
        this.properties['value'] = val;
        this.setOutputData(0, val);
        this.sendMessageToDashboard({ value: val });
        this.sendIOValuesToEditor();
    };

    onGetMessageToDashboardSide(data) {
        if (data.value)
            $('#button-' + this.id).addClass("blue");
        else
            $('#button-' + this.id).removeClass("blue");
    };
}

Container.registerNodeType("ui/toggle", UiToggleNode);


