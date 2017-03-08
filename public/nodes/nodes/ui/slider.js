/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../container", "./ui-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../container");
    const ui_node_1 = require("./ui-node");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
        <span id="nodeTitle-{{id}}"></span>\
        <br />\
        <div id="slider-{{id}}"></div>\
    </div>';
    class UiSliderNode extends ui_node_1.UiNode {
        constructor() {
            super("Slider", template);
            this.UPDATE_INTERVAL = 100;
            this.dataUpdated = false;
            this.descriprion = "";
            this.properties['value'] = 0;
            this.settings["min"] = { description: "Min", type: "number", value: 0 };
            this.settings["max"] = { description: "Max", type: "number", value: 100 };
            this.addOutput("output", "number");
        }
        onAdded() {
            super.onAdded();
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
                let that = this;
                this.slider.noUiSlider.on('slide', function () {
                    let val = that.slider.noUiSlider.get();
                    that.properties['value'] = val;
                    that.dataUpdated = true;
                });
                this.startSendingToServer();
                this.onGetMessageToDashboardSide({ value: this.properties['value'] });
            }
        }
        onSettingsChanged() {
            super.onSettingsChanged();
            if (this.side == container_1.Side.dashboard) {
                $("#slider-" + this.id)[0].noUiSlider.updateOptions({
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
                    that.sendMessageToServerSide({ value: that.properties['value'] });
                }
            }, this.UPDATE_INTERVAL);
        }
        onGetMessageToServerSide(data) {
            this.isRecentlyActive = true;
            this.properties['value'] = data.value;
            this.setOutputData(0, data.value);
            this.sendIOValuesToEditor();
            this.sendMessageToDashboardSide(data);
        }
        ;
        onGetMessageToDashboardSide(data) {
            this.slider.noUiSlider.set(data.value);
        }
        ;
    }
    exports.UiSliderNode = UiSliderNode;
    container_1.Container.registerNodeType("ui/slider", UiSliderNode);
});
//# sourceMappingURL=slider.js.map