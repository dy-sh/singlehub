/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../node";
import Utils from "../../utils";
import {Side, Container} from "../../container";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
    <span id="labelName-{{id}}"></span>\
    <div class="ui right floated basic disabled button nonbutton">\
    <span class="ui blue basic label" id="labelValue-{{id}}"></span>\
    </div>\
    </div>';


//Watch a value in the editor
export class UiLabelNode extends Node {
    UPDATE_INTERVAL = 100;

    lastData: any;
    dataUpdated = false;

    constructor() {
        super();

        this.title = "Label";
        this.descriprion = "Show value of input";
        this.size = [60, 20];

        this.createOnDashboard = true;

        this.addInput("input");
    }

    onAdded = function () {
        if (this.side == Side.server)
            this.startSendingToDashboard();

        if (this.side == Side.dashboard) {
            let labelTemplate = Handlebars.compile(template);
            $(labelTemplate(this))
                .hide()
                .appendTo("#uiContainer-" + this.container.id)
                .fadeIn(300);
        }
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
                let val = Utils.formatAndTrimValue(that.lastData);
                that.sendMessageToDashboardSide({value: val});
            }
        }, this.UPDATE_INTERVAL);
    }


    onGetMessageToDashboardSide = function (data) {
        $('#labelName-' + this.id).html(this.title);
        $('#labelValue-' + this.id).html(data.value);
    };


    onRemoved = function () {
        if (this.side == Side.dashboard) {
            console.log("rem")
            $('#node-' + this.id).fadeOut(300, function () {
                $(this).remove();
            });
        }
    }
}

Container.registerNodeType("ui/label", UiLabelNode);



