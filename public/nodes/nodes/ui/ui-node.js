/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../node", "../../container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("../../node");
    const container_1 = require("../../container");
    class UiNode extends node_1.Node {
        constructor(titlePrefix, template) {
            super();
            this.titlePrefix = titlePrefix;
            this.template = template;
            this.isDashboardNode = true;
            this.settings["title"] = { description: "Title", type: "string", value: this.titlePrefix };
        }
        onAdded() {
            if (this.side == container_1.Side.dashboard) {
                let templ = Handlebars.compile(this.template);
                $(templ(this))
                    .hide()
                    .appendTo("#uiContainer-" + this.container.id)
                    .fadeIn(300);
            }
            this.changeTitle();
        }
        onSettingsChanged() {
            this.changeTitle();
        }
        changeTitle() {
            if (this.side == container_1.Side.dashboard) {
                $('#nodeTitle-' + this.id).html(this.settings["title"].value);
            }
            let t = this.settings["title"].value;
            if (t.length > 10)
                t = t.substr(0, 10) + "...";
            if (t == this.titlePrefix || t == "")
                this.title = this.titlePrefix;
            else
                this.title = this.titlePrefix + ": " + t;
            this.size = this.computeSize();
        }
        onRemoved() {
            if (this.side == container_1.Side.dashboard) {
                $('#node-' + this.id).fadeOut(300, function () {
                    $(this).remove();
                });
            }
        }
    }
    exports.UiNode = UiNode;
});
//# sourceMappingURL=ui-node.js.map