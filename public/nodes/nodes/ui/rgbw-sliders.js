/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../utils", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const utils_1 = require("../../utils");
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <br />\
        <div id="slider-{{id}}-r" class="spacebottom"></div>\
        <div id="slider-{{id}}-g" class="spacebottom"></div>\
        <div id="slider-{{id}}-b" class="spacebottom"></div>\
        <div id="slider-{{id}}-w"></div>\
    </div>';
    class UiRGBWSlidersNode extends ui_node_1.UiNode {
        constructor() {
            super("RGB Sliders", template);
            this.UPDATE_INTERVAL = 100;
            this.dataUpdated = false;
            this.descriprion = "";
            this.properties['r'] = 0;
            this.properties['g'] = 0;
            this.properties['b'] = 0;
            this.properties['w'] = 0;
            this.addOutput("output", "string");
        }
        onAdded() {
            super.onAdded();
            if (this.side == container_1.Side.dashboard) {
                this.sliderR = $("#slider-" + this.id + "-r")[0];
                this.sliderG = $("#slider-" + this.id + "-g")[0];
                this.sliderB = $("#slider-" + this.id + "-b")[0];
                this.sliderW = $("#slider-" + this.id + "-w")[0];
                noUiSlider.create(this.sliderR, {
                    start: 0,
                    connect: 'lower',
                    animate: false,
                    range: { 'min': 0, 'max': 255 }
                });
                noUiSlider.create(this.sliderG, {
                    start: 0,
                    connect: 'lower',
                    animate: false,
                    range: { 'min': 0, 'max': 255 }
                });
                noUiSlider.create(this.sliderB, {
                    start: 0,
                    connect: 'lower',
                    animate: false,
                    range: { 'min': 0, 'max': 255 }
                });
                noUiSlider.create(this.sliderW, {
                    start: 0,
                    connect: 'lower',
                    animate: false,
                    range: { 'min': 0, 'max': 255 }
                });
                let that = this;
                this.sliderR.noUiSlider.on('slide', function () {
                    that.properties['r'] = that.sliderR.noUiSlider.get();
                    that.dataUpdated = true;
                });
                this.sliderG.noUiSlider.on('slide', function () {
                    that.properties['g'] = that.sliderG.noUiSlider.get();
                    that.dataUpdated = true;
                });
                this.sliderB.noUiSlider.on('slide', function () {
                    that.properties['b'] = that.sliderB.noUiSlider.get();
                    that.dataUpdated = true;
                });
                this.sliderW.noUiSlider.on('slide', function () {
                    that.properties['w'] = that.sliderW.noUiSlider.get();
                    that.dataUpdated = true;
                });
                this.startSendingToServer();
                this.onGetMessageToDashboardSide({
                    r: this.properties['r'],
                    g: this.properties['g'],
                    b: this.properties['b'],
                    w: this.properties['w'],
                });
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
                        w: that.properties['w'],
                    });
                }
            }, this.UPDATE_INTERVAL);
        }
        onGetMessageToServerSide(data) {
            this.isRecentlyActive = true;
            this.properties['r'] = data.r;
            this.properties['g'] = data.r;
            this.properties['b'] = data.r;
            this.properties['w'] = data.r;
            let hex = utils_1.default.numsToRgbwHex([data.r, data.g, data.b, data.w]);
            this.setOutputData(0, hex);
            this.sendIOValuesToEditor();
            this.sendMessageToDashboardSide(data);
        }
        ;
        onGetMessageToDashboardSide(data) {
            this.sliderR.noUiSlider.set(data.r);
            this.sliderG.noUiSlider.set(data.g);
            this.sliderB.noUiSlider.set(data.b);
            this.sliderW.noUiSlider.set(data.w);
        }
        ;
    }
    exports.UiRGBWSlidersNode = UiRGBWSlidersNode;
    container_1.Container.registerNodeType("ui/rgbw-sliders", UiRGBWSlidersNode);
});
//# sourceMappingURL=rgbw-sliders.js.map