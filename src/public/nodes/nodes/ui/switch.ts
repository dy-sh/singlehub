/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Container, Side } from "../../container";
import { UiNode } from "./ui-node";

let template =
    '  <div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <div class="ui right floated basic  button nonbutton">\
            <label class="switch">\
            <input type="checkbox" class="switch-input" id="switch-{{id}}">\
            <span class="switch-label" data-on="On" data-off="Off"></span>\
            <span class="switch-handle"></span>\
            </label>\
        </div>\
    </div>';

export class UiSwitchNode extends UiNode {

    constructor() {
        super("Switch", template, "UiSwitchNode");

        this.descriprion = "";
        this.properties['value'] = false;

        this.addOutput("output", "boolean");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['value']);

        if (this.side == Side.dashboard) {
            let that = this;
            $('#switch-' + this.id).click(function () {
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
        this.sendMessageToDashboardSide({ value: val });
        this.sendIOValuesToEditor();
    };

    onGetMessageToDashboardSide(data) {
        $('#switch-' + this.id).prop('checked', data.value == true);
    };
}

Container.registerNodeType("ui/switch", UiSwitchNode);
