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
        <div class="ui form text-box-form">\
            <div class="ui field">\
                <div class="ui small action input">\
                    <input type="text" id="textBoxText-{{id}}">\
                    <button type="button" class="ui small button" id="textBoxSend-{{id}}">Send</button>\
                </div>\
            </div>\
        </div>\
    </div>';


export class UiTextBoxNode extends UiNode {

    constructor() {
        super("TextBox", template);

        this.descriprion = "";
        this.properties['value'] = null;

        this.addOutput("output", "string");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['value']);

        if (this.side == Side.dashboard) {
            let that = this;
            $('#textBoxSend-' + this.id).click(function () {
                let value = $('#textBoxText-' + that.id).val();
                that.sendMessageToServerSide({ value: value });
            });

            this.onGetMessageToDashboardSide({ value: this.properties['value'] })
        }
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        if (data.value == "")
            data.value = null;
        this.properties['value'] = data.value;
        this.setOutputData(0, data.value);
        this.sendMessageToDashboard(data);
        this.sendIOValuesToEditor();
    };

    onGetMessageToDashboardSide(data) {
        $('#textBoxText-' + this.id).val(data.value);
    };
}

Container.registerNodeType("ui/text-box", UiTextBoxNode);


