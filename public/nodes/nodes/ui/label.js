/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node", "../../utils", "../../container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("../../node");
    const utils_1 = require("../../utils");
    const container_1 = require("../../container");
    let template = '<div class="ui attached clearing segment" id="node-{{id}}">\
    <span id="labelName-{{id}}"></span>\
    <div class="ui right floated basic disabled button nonbutton">\
    <span class="ui blue basic label" id="labelValue-{{id}}"></span>\
    </div>\
    </div>';
    //Watch a value in the editor
    class UiLabelNode extends node_1.Node {
        constructor() {
            super();
            this.UPDATE_INTERVAL = 300;
            this.dataUpdated = false;
            this.onAdded = function () {
                if (this.side == container_1.Side.server)
                    this.startSendingToDashboard();
                if (this.side == container_1.Side.dashboard) {
                    let labelTemplate = Handlebars.compile(template);
                    $(labelTemplate(this))
                        .hide()
                        .appendTo("#uiContainer-" + this.container.id)
                        .fadeIn(300);
                }
            };
            this.onInputUpdated = function () {
                this.lastData = this.getInputData(0);
                this.dataUpdated = true;
                this.isRecentlyActive = true;
            };
            this.onGetMessageToDashboardSide = function (data) {
                console.log("111 " + data);
                $('#labelName-' + this.id).html(this.title);
                $('#labelValue-' + this.id).html(data.value);
            };
            this.onRemoved = function () {
            };
            this.title = "Label";
            this.descriprion = "Show value of input";
            this.size = [60, 20];
            this.createOnDashboard = true;
            this.addInput("input");
        }
        startSendingToDashboard() {
            let that = this;
            setInterval(function () {
                if (that.dataUpdated) {
                    that.dataUpdated = false;
                    let val = utils_1.default.formatAndTrimValue(that.lastData);
                    that.sendMessageToDashboardSide({ value: val });
                }
            }, this.UPDATE_INTERVAL);
        }
    }
    exports.UiLabelNode = UiLabelNode;
    container_1.Container.registerNodeType("ui/label", UiLabelNode);
});
//# sourceMappingURL=label.js.map