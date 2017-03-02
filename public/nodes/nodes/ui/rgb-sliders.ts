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
        <div id="slider-{{id}}-r" class="spacebottom"></div>\
        <div id="slider-{{id}}-g" class="spacebottom"></div>\
        <div id="slider-{{id}}-b"></div>\
    </div>';

declare let noUiSlider;

export class UiRGBSlidersNode extends UiNode {
    UPDATE_INTERVAL = 100;

    dataUpdated = false;

    sliderR: HTMLElement;
    sliderG: HTMLElement;
    sliderB: HTMLElement;


    constructor() {
        super("RGB Sliders", template);

        this.descriprion = "";
        this.properties['r'] = 0;
        this.properties['g'] = 0;
        this.properties['b'] = 0;

        this.addOutput("output", "string");
    }

    onAdded() {
        super.onAdded();

        if (this.side == Side.dashboard) {

            this.sliderR = $("#slider-" + this.id + "-r")[0];
            this.sliderG = $("#slider-" + this.id + "-g")[0];
            this.sliderB = $("#slider-" + this.id + "-b")[0];

            noUiSlider.create(this.sliderR, {
                start: 0,
                connect: 'lower',
                animate: false,
                range: {'min': 0, 'max': 255}
            });
            noUiSlider.create(this.sliderG, {
                start: 0,
                connect: 'lower',
                animate: false,
                range: {'min': 0, 'max': 255}
            });
            noUiSlider.create(this.sliderB, {
                start: 0,
                connect: 'lower',
                animate: false,
                range: {'min': 0, 'max': 255}
            });


            let that = this;
            (<any>this.sliderR).noUiSlider.on('slide', function () {
                that.properties['r'] = (<any>that.sliderR).noUiSlider.get();
                that.dataUpdated = true;
            });
            (<any>this.sliderG).noUiSlider.on('slide', function () {
                that.properties['g'] = (<any>that.sliderG).noUiSlider.get();
                that.dataUpdated = true;
            });
            (<any>this.sliderB).noUiSlider.on('slide', function () {
                that.properties['b'] = (<any>that.sliderB).noUiSlider.get();
                that.dataUpdated = true;
            });

            this.startSendingToServer();

            this.onGetMessageToDashboardSide({
                r: this.properties['r'],
                g: this.properties['g'],
                b: this.properties['b'],
            })
        }
    }


    startSendingToServer() {
        let that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToServerSide({
                    r: that.properties['r'],
                    g: that.properties['g'],
                    b: that.properties['b'],
                });
            }
        }, this.UPDATE_INTERVAL);
    }

    onGetMessageToServerSide(data) {
        this.isRecentlyActive = true;
        this.properties['r'] = data.r;
        this.properties['g'] = data.r;
        this.properties['b'] = data.r;
        let hex = Utils.num2hex([data.r, data.g, data.b]);
        this.setOutputData(0, hex);
        this.sendIOValuesToEditor();
        this.sendMessageToDashboardSide(data);
    };

    onGetMessageToDashboardSide(data) {
        (<any>this.sliderR).noUiSlider.set(data.r);
        (<any>this.sliderG).noUiSlider.set(data.g);
        (<any>this.sliderB).noUiSlider.set(data.b);
    };
}

Container.registerNodeType("ui/rgb-sliders", UiRGBSlidersNode);
