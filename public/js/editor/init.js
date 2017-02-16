/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes", "../../nodes/container", "../../nodes/nodes/main", "../../nodes/nodes/debug", "../../nodes/nodes/math", "./node-editor", "./editor-socket"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const container_1 = require("../../nodes/container");
    require("../../nodes/nodes/main");
    require("../../nodes/nodes/debug");
    require("../../nodes/nodes/math");
    const node_editor_1 = require("./node-editor");
    const editor_socket_1 = require("./editor-socket");
    window.rootContainer = container_1.rootContainer;
    window.editor = node_editor_1.editor;
    window.Nodes = nodes_1.Nodes;
    window.Container = container_1.Container;
    window.renderer = node_editor_1.editor.renderer;
    // socket.container_id=editor.renderer.container.container_id;
    window.addEventListener("resize", function () {
        node_editor_1.editor.renderer.resize();
    });
    editor_socket_1.socket.getNodes();
    editor_socket_1.socket.getContainerState();
});
//
//
// let node_const_A = Nodes.createNode("main/constant");
// node_const_A.pos = [200, 200];
// container.add(node_const_A);
// node_const_A.setValue(5);
//
// let node_const_B =  Nodes.createNode("main/constant");
// node_const_B.pos = [200, 300];
// container.add(node_const_B);
// node_const_B.setValue(10);
//
// let node_math =  Nodes.createNode("math/operation");
// node_math.pos = [400, 200];
// node_math.properties.OP = "-";
// node_math.addOutput("A-B");
// container.add(node_math);
//
// let node_watch =  Nodes.createNode("basic/console");
// node_watch.pos = [700, 200];
// container.add(node_watch);
//
// // let node_watch2 = nodes.createNode("basic/console");
// // node_watch2.pos = [700, 300];
// // container.add(node_watch2);
//
//
// node_const_A.connect(0, node_math, 0);
// node_const_B.connect(0, node_math, 1);
// node_math.connect(0, node_watch, 0);
// // node_math.connect(0, node_watch2, 0);
// container.run(1000);
// container.runStep(1);
//
// setInterval(function () {
//     container.runStep(1);
// }, 1000);
//# sourceMappingURL=init.js.map