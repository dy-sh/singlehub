/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../app"], factory);
    }
})(function (require, exports) {
    "use strict";
    const app_1 = require("../app");
    let rootContainer = app_1.app.rootContainer;
    module.exports.test = function () {
        let node_const_A = rootContainer.createNode("main/constant");
        node_const_A.pos = [10, 10];
        node_const_A.settings["value"].value = 5.4;
        let node_const_B = rootContainer.createNode("main/constant");
        node_const_B.pos = [10, 100];
        node_const_B.settings["value"].value = 5.4;
        let node_math = rootContainer.createNode("math/plus");
        node_math.pos = [200, 50];
        let node_watch = rootContainer.createNode("debug/console");
        node_watch.pos = [400, 50];
        // let node_watch2 = rootContainer.createNode("basic/console");
        // node_watch2.pos = [700, 300];
        // rootContainer.add(node_watch2);
        node_const_A.connect(0, node_math.id, 0);
        node_const_B.connect(0, node_math.id, 1);
        node_math.connect(0, node_watch.id, 0);
        // node_math.connect(0, node_watch2.id, 0);
        // rootContainer.runStep(1);
        //
        // setInterval(function () {
        // 	rootContainer.runStep(1);
        // }, 1000);
    };
});
//# sourceMappingURL=test.js.map