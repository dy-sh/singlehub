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
var node_1 = require("../../node");
var container_1 = require("../../container");
var UiNode = (function (_super) {
    __extends(UiNode, _super);
    function UiNode(titlePrefix, template) {
        _super.call(this);
        this.titlePrefix = titlePrefix;
        this.template = template;
        this.isDashboardNode = true;
        this.settings["title"] = { description: "Title", type: "string", value: this.titlePrefix };
    }
    UiNode.prototype.onAdded = function () {
        if (this.side == container_1.Side.dashboard) {
            var templ = Handlebars.compile(this.template);
            $(templ(this))
                .hide()
                .appendTo("#uiContainer-" + this.container.id)
                .fadeIn(300);
        }
        this.changeTitle();
    };
    UiNode.prototype.onSettingsChanged = function () {
        this.changeTitle();
    };
    UiNode.prototype.changeTitle = function () {
        if (this.side == container_1.Side.dashboard) {
            $('#nodeTitle-' + this.id).html(this.settings["title"].value);
        }
        var t = this.settings["title"].value;
        if (t.length > 10)
            t = t.substr(0, 10) + "...";
        if (t == this.titlePrefix || t == "")
            this.title = this.titlePrefix;
        else
            this.title = this.titlePrefix + ": " + t;
        this.size = this.computeSize();
    };
    UiNode.prototype.onRemoved = function () {
        if (this.side == container_1.Side.dashboard) {
            $('#node-' + this.id).fadeOut(300, function () {
                $(this).remove();
            });
        }
    };
    return UiNode;
}(node_1.Node));
exports.UiNode = UiNode;
