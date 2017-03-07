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
var container_1 = require("../../container");
var ui_node_1 = require("./ui-node");
var template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <br />\
        <div id="slider-{{id}}"></div>\
    </div>';
var UiSliderNode = (function (_super) {
    __extends(UiSliderNode, _super);
    function UiSliderNode() {
        _super.call(this, "Slider", template);
        this.UPDATE_INTERVAL = 100;
        this.dataUpdated = false;
        this.descriprion = "";
        this.properties['value'] = 0;
        this.settings["min"] = { description: "Min", type: "number", value: 0 };
        this.settings["max"] = { description: "Max", type: "number", value: 100 };
        this.addOutput("output", "number");
    }
    UiSliderNode.prototype.onAdded = function () {
        _super.prototype.onAdded.call(this);
        if (this.side == container_1.Side.server)
            this.setOutputData(0, this.properties['value']);
        if (this.side == container_1.Side.dashboard) {
            this.slider = $("#slider-" + this.id)[0];
            noUiSlider.create(this.slider, {
                start: 0,
                connect: 'lower',
                animate: false,
                range: {
                    'min': this.settings["min"].value,
                    'max': this.settings["max"].value
                }
            });
            var that_1 = this;
            this.slider.noUiSlider.on('slide', function () {
                var val = that_1.slider.noUiSlider.get();
                that_1.properties['value'] = val;
                that_1.dataUpdated = true;
            });
            this.startSendingToServer();
            this.onGetMessageToDashboardSide({ value: this.properties['value'] });
        }
    };
    UiSliderNode.prototype.onSettingsChanged = function () {
        _super.prototype.onSettingsChanged.call(this);
        if (this.side == container_1.Side.dashboard) {
            $("#slider-" + this.id)[0].noUiSlider.updateOptions({
                range: {
                    'min': this.settings["min"].value,
                    'max': this.settings["max"].value
                }
            });
        }
    };
    UiSliderNode.prototype.startSendingToServer = function () {
        var that = this;
        setInterval(function () {
            if (that.dataUpdated) {
                that.dataUpdated = false;
                that.sendMessageToServerSide({ value: that.properties['value'] });
            }
        }, this.UPDATE_INTERVAL);
    };
    UiSliderNode.prototype.onGetMessageToServerSide = function (data) {
        this.isRecentlyActive = true;
        this.properties['value'] = data.value;
        this.setOutputData(0, data.value);
        this.sendIOValuesToEditor();
        this.sendMessageToDashboardSide(data);
    };
    ;
    UiSliderNode.prototype.onGetMessageToDashboardSide = function (data) {
        this.slider.noUiSlider.set(data.value);
    };
    ;
    return UiSliderNode;
}(ui_node_1.UiNode));
exports.UiSliderNode = UiSliderNode;
container_1.Container.registerNodeType("ui/slider", UiSliderNode);
