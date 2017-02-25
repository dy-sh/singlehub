/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Nodes} from "../../nodes";
import {Node} from "../../node";
import Utils from "../../utils";
import {Side} from "../../container";

let template =
    '<script id="labelTemplate" type="text/x-handlebars-template">\
    <div class="ui attached clearing segment" id="node-{{id}}">\
    <span id="labelName-{{id}}"></span>\
    <div class="ui right floated basic disabled button nonbutton">\
    <span class="ui blue basic label" id="labelValue-{{id}}"></span>\
    </div>\
    </div>\
    </script>';





//Watch a value in the editor
export class UiLabelNode extends Node {
    UPDATE_INTERVAL: number;

    lastData: any;
    dataUpdated = false;

    constructor() {
        super();

        this.title = "Label";
        this.descriprion = "Show value of input";
        this.size = [60, 20];

        this.createOnDashboard = true;

        this.UPDATE_INTERVAL = 300;

        this.addInput("input");

        if (this.side == Side.server)
            this.startSendingToDashboard();
    }

    onInputUpdated = function () {
        this.lastData = this.getInputData(0);
        this.dataUpdated = true;
        this.isRecentlyActive = true;
    };

    startSendingToDashboard() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                let val = Utils.formatAndTrimValue(this.lastData);
                that.sendMessageToDashboardSide({value: val});
            }
        }, this.UPDATE_INTERVAL);
    }


    onGetMessageToDashboardSide = function (data) {
        console.log("!!!!" + data.value);
        $('#labelName-' + this.id).html(this.title);
        $('#labelValue-' + this.id).html(data.value);
    };

    onAdded = function () {
        if (this.side == Side.dashboard) {
            let labelTemplate = Handlebars.compile(template);
            $(labelTemplate(this))
                .hide()
                .appendTo("#uiContainer-" + this.container.id)
                .fadeIn(300);
        }
    }


    onRemoved = function () {

    }
}

Nodes.registerNodeType("ui/label", UiLabelNode);



