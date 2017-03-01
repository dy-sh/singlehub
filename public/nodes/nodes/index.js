/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes/main", "../../nodes/nodes/debug", "../../nodes/nodes/math", "../../nodes/nodes/ui/label", "../../nodes/nodes/ui/toggle", "../../nodes/nodes/ui/state", "../../nodes/nodes/ui/button", "../../nodes/nodes/ui/switch"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * Add all new nodes classes here!!!
     */
    require("../../nodes/nodes/main");
    require("../../nodes/nodes/debug");
    require("../../nodes/nodes/math");
    require("../../nodes/nodes/ui/label");
    require("../../nodes/nodes/ui/toggle");
    require("../../nodes/nodes/ui/state");
    require("../../nodes/nodes/ui/button");
    require("../../nodes/nodes/ui/switch");
});
//# sourceMappingURL=index.js.map