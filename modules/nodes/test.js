/**
 * Created by Derwish on 04.07.2016.
 */
"use strict";
const nodes_1 = require("./nodes");
const nodes_engine_1 = require("./nodes-engine");
let nodesEngine = new nodes_engine_1.NodesEngine();
module.exports.test = function () {
    //graph.start(1);
    setInterval(function () {
        nodesEngine.runStep(1);
    }, 2000);
    let node_const_A = nodes_1.Nodes.createNode("basic/const");
    node_const_A.pos = [200, 200];
    nodesEngine.add(node_const_A);
    node_const_A.setValue(5);
    let node_const_B = nodes_1.Nodes.createNode("basic/const");
    node_const_B.pos = [200, 300];
    nodesEngine.add(node_const_B);
    node_const_B.setValue(10);
    let node_math = nodes_1.Nodes.createNode("math/operation");
    node_math.pos = [400, 200];
    node_math.properties.OP = "-";
    node_math.addOutput("A-B");
    nodesEngine.add(node_math);
    let node_watch = nodes_1.Nodes.createNode("basic/console");
    node_watch.pos = [700, 200];
    nodesEngine.add(node_watch);
    // let node_watch2 = nodes.createNode("basic/console");
    // node_watch2.pos = [700, 300];
    // nodesEngine.add(node_watch2);
    node_const_A.connect(0, node_math, 0);
    node_const_B.connect(0, node_math, 1);
    node_math.connect(0, node_watch, 0);
    // node_math.connect(0, node_watch2, 0);
};
//# sourceMappingURL=test.js.map