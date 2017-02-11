/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes", "../../nodes/nodes-engine", "../../nodes/nodes/main", "../../nodes/nodes/debug", "../../nodes/nodes/math", "./node-editor", "./editor-socket"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const nodes_engine_1 = require("../../nodes/nodes-engine");
    require("../../nodes/nodes/main");
    require("../../nodes/nodes/debug");
    require("../../nodes/nodes/math");
    const node_editor_1 = require("./node-editor");
    const editor_socket_1 = require("./editor-socket");
    // (<any>window).engine = engine;
    window.engine = nodes_engine_1.engine;
    window.editor = node_editor_1.editor;
    window.Nodes = nodes_1.Nodes;
    window.NodesEngine = nodes_engine_1.NodesEngine;
    window.renderer = node_editor_1.editor.renderer;
    // socket.container_id=editor.renderer.engine.container_id;
    window.addEventListener("resize", function () {
        node_editor_1.editor.renderer.resize();
    });
    editor_socket_1.socket.getNodes();
    editor_socket_1.socket.getEngineState();
});
//
//
// let node_const_A = Nodes.createNode("main/constant");
// node_const_A.pos = [200, 200];
// engine.add(node_const_A);
// node_const_A.setValue(5);
//
// let node_const_B =  Nodes.createNode("main/constant");
// node_const_B.pos = [200, 300];
// engine.add(node_const_B);
// node_const_B.setValue(10);
//
// let node_math =  Nodes.createNode("math/operation");
// node_math.pos = [400, 200];
// node_math.properties.OP = "-";
// node_math.addOutput("A-B");
// engine.add(node_math);
//
// let node_watch =  Nodes.createNode("basic/console");
// node_watch.pos = [700, 200];
// engine.add(node_watch);
//
// // let node_watch2 = nodes.createNode("basic/console");
// // node_watch2.pos = [700, 300];
// // nodesEngine.add(node_watch2);
//
//
// node_const_A.connect(0, node_math, 0);
// node_const_B.connect(0, node_math, 1);
// node_math.connect(0, node_watch, 0);
// // node_math.connect(0, node_watch2, 0);
// engine.run(1000);
// nodesEngine.runStep(1);
//
// setInterval(function () {
//     nodesEngine.runStep(1);
// }, 1000);
//# sourceMappingURL=init.js.map