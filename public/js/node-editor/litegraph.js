// import {Nodes, Node} from "../../nodes/nodes"
// import {LGraphCanvas} from "./litegraph-canvas"
// import {NodesEngine} from "../../nodes/nodes-engine"
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes/base", "../../nodes/nodes/math", "./litegraph-editor"], factory);
    }
})(function (require, exports) {
    "use strict";
    require("../../nodes/nodes/base");
    require("../../nodes/nodes/math");
    const litegraph_editor_1 = require("./litegraph-editor");
    let editor = new litegraph_editor_1.Editor("main");
    window.graph = editor.graph;
    window.addEventListener("resize", function () {
        editor.graphcanvas.resize();
    });
    //getNodes();
    let nodesEngine = editor.graph;
    //let nodesEngine = new NodesEngine();
    let node_const_A = this.nodes.createNode("basic/const");
    node_const_A.pos = [200, 200];
    nodesEngine.add(node_const_A);
    node_const_A.setValue(5);
    let node_const_B = this.nodes.createNode("basic/const");
    node_const_B.pos = [200, 300];
    nodesEngine.add(node_const_B);
    node_const_B.setValue(10);
    let node_math = this.nodes.createNode("math/operation");
    node_math.pos = [400, 200];
    node_math.properties.OP = "-";
    node_math.addOutput("A-B");
    nodesEngine.add(node_math);
    let node_watch = this.nodes.createNode("basic/console");
    node_watch.pos = [700, 200];
    nodesEngine.add(node_watch);
    // let node_watch2 = nodes.createNode("basic/console");
    // node_watch2.pos = [700, 300];
    // nodesEngine.add(node_watch2);
    node_const_A.connect(0, node_math, 0);
    node_const_B.connect(0, node_math, 1);
    node_math.connect(0, node_watch, 0);
    // node_math.connect(0, node_watch2, 0);
    nodesEngine.start(1000);
    // nodesEngine.runStep(1);
    //
    // setInterval(function () {
    //     nodesEngine.runStep(1);
    // }, 1000);
    if (window.theme) {
        let theme = window.theme;
        $.getScript(`/js/node-editor/node-editor-theme${theme}.js`, function () {
        });
    }
    console.log("ok");
});
//# sourceMappingURL=litegraph.js.map