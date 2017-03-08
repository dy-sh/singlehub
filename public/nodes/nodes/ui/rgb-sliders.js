/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../../utils");
var container_1 = require("../../container");
var ui_node_1 = require("./ui-node");
var template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <br />\
        <div id="slider-{{id}}-r" class="spacebottom"></div>\
        <div id="slider-{{id}}-g" class="spacebottom"></div>\
        <div id="slider-{{id}}-b"></div>\
    </div>';
var UiRGBSlidersNode = (function (_super) {
    __extends(UiRGBSlidersNode, _super);
    function UiRGBSlidersNode() {
        _super.call(this, "RGB Sliders", template);
        this.UPDATE_INTERVAL = 100;
        this.dataUpdated = false;
        this.descriprion = "";
        this.properties['r'] = 0;
        this.properties['g'] = 0;
        this.properties['b'] = 0;
        this.addOutput("output", "string");
    }
    UiRGBSlidersNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server) {
            var hex = utils_1.default.numsToRgbHex([
                this.properties['r'],
                this.properties['g'],
                this.properties['b']]);
            this.setOutputData(0, hex);
        }
        if (this.side == container_1.Side.dashboard) {
            this.sliderR = $("#slider-" + this.id + "-r")[0];
            this.sliderG = $("#slider-" + this.id + "-g")[0];
            this.sliderB = $("#slider-" + this.id + "-b")[0];
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
            var that_1 = this;
            this.sliderR.noUiSlider.on('slide', function () {
                that_1.properties['r'] = that_1.sliderR.noUiSlider.get();
                that_1.dataUpdated = true;
            });
            this.sliderG.noUiSlider.on('slide', function () {
                that_1.properties['g'] = that_1.sliderG.noUiSlider.get();
                that_1.dataUpdated = true;
            });
            this.sliderB.noUiSlider.on('slide', function () {
                that_1.properties['b'] = that_1.sliderB.noUiSlider.get();
                that_1.dataUpdated = true;
            });
            this.startSendingToServer();
            this.onGetMessageToDashboardSide({
                r: this.properties['r'],
                g: this.properties['g'],
                b: this.properties['b'],
            });
        }
    };
    UiRGBSlidersNode.prototype.startSendingToServer = function () {
        var that = this;
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
    };
    UiRGBSlidersNode.prototype.onGetMessageToServerSide = function (data) {
        this.isRecentlyActive = true;
        this.properties['r'] = data.r;
        this.properties['g'] = data.r;
        this.properties['b'] = data.r;
        var hex = utils_1.default.numsToRgbHex([data.r, data.g, data.b]);
        this.setOutputData(0, hex);
        this.sendIOValuesToEditor();
        this.sendMessageToDashboardSide(data);
    };
    ;
    UiRGBSlidersNode.prototype.onGetMessageToDashboardSide = function (data) {
        this.sliderR.noUiSlider.set(data.r);
        this.sliderG.noUiSlider.set(data.g);
        this.sliderB.noUiSlider.set(data.b);
    };
    ;
    return UiRGBSlidersNode;
}(ui_node_1.UiNode));
exports.UiRGBSlidersNode = UiRGBSlidersNode;
container_1.Container.registerNodeType("ui/rgb-sliders", UiRGBSlidersNode);
