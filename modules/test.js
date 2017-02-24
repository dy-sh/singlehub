/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../public/nodes/nodes", "../app"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../public/nodes/nodes");
    const app_1 = require("../app");
    let rootContainer = app_1.app.rootContainer;
    module.exports.test = function () {
        let node_const_A = nodes_1.Nodes.createNode("main/constant");
        node_const_A.pos = [10, 10];
        rootContainer.add(node_const_A);
        node_const_A.settings["value"].value = 5.4;
        let node_const_B = nodes_1.Nodes.createNode("main/constant");
        node_const_B.pos = [10, 100];
        rootContainer.add(node_const_B);
        node_const_B.settings["value"].value = 5.4;
        let node_math = nodes_1.Nodes.createNode("math/plus");
        node_math.pos = [200, 50];
        rootContainer.add(node_math);
        let node_watch = nodes_1.Nodes.createNode("debug/console");
        node_watch.pos = [400, 50];
        rootContainer.add(node_watch);
        // let node_watch2 = nodes.createNode("basic/console");
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