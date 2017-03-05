/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../../node";
import Utils from "../../utils";
import {Side, Container} from "../../container";
import {UiNode} from "./ui-node";

let template =
    '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <br />\
        <div id="slider-{{id}}"></div>\
    </div>';

declare let noUiSlider;

export class UiSliderNode extends UiNode {
    UPDATE_INTERVAL = 100;

    dataUpdated = false;

    slider: HTMLElement;

    constructor() {
        super("Slider", template);

        this.descriprion = "";
        this.properties['value'] = 0;

        this.settings["min"] = {description: "Min", type: "number", value: 0};
        this.settings["max"] = {description: "Max", type: "number", value: 100};

        this.addOutput("output", "number");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.server)
            this.setOutputData(0, this.properties['value']);

        if (this.side == Side.dashboard) {

            this.slider = $("#slider-" + this.id)[0];
            noUiSlider.create(this.slider,
                {
                    start: 0,
                    connect: 'lower',
                    animate: false,
                    range: {
                        'min': this.settings["min"].value,
                        'max': this.settings["max"].value
                    }
                });

            let that = this;
            (<any>this.slider).noUiSlider.on('slide', function () {
                let val = (<any>that.slider).noUiSlider.get();
                that.properties['value'] = val;
                that.dataUpdated = true;
            });

            this.startSendingToServer();

            this.onGetMessageToDashboardSide({value: this.properties['value']})
        }
    }


    onSettingsChanged() {
        super.onSettingsChanged();

        if (this.side == Side.dashboard) {
            (<any>$("#slider-" + this.id)[0]).noUiSlider.updateOptions({
                range: {
                    'min': this.settings["min"].value,
                    'max': this.settings["max"].value
                }
            });
        }
    }


    startSendingToServer() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToServerSide({value: that.properties['value']});
            }
        }, this.UPDATE_INTERVAL);
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        this.properties['value'] = data.value;
        this.setOutputData(0, data.value);
        this.sendIOValuesToEditor();
        this.sendMessageToDashboardSide(data);
    };

    onGetMessageToDashboardSide(data) {
        (<any>this.slider).noUiSlider.set(data.value);
    };
}

Container.registerNodeType("ui/slider", UiSliderNode);
