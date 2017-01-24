

import {Nodes, Node} from "../../nodes/nodes"
// import {LGraphCanvas} from "./litegraph-canvas"
import {nodesEngine} from "../../nodes/nodes-engine"

import "../../nodes/nodes/base";
import "../../nodes/nodes/math";

import {editor} from "./litegraph-editor";






(<any>window).graph = nodesEngine;
(<any>window).editor = editor;
(<any>window).nodes = Nodes;

window.addEventListener("resize", function () {
    editor.graphcanvas.resize();
});
//getNodes();



let node_const_A = Nodes.createNode("basic/const");
node_const_A.pos = [200, 200];
nodesEngine.add(node_const_A);
node_const_A.setValue(5);

let node_const_B =  Nodes.createNode("basic/const");
node_const_B.pos = [200, 300];
nodesEngine.add(node_const_B);
node_const_B.setValue(10);

let node_math =  Nodes.createNode("math/operation");
node_math.pos = [400, 200];
node_math.properties.OP = "-";
node_math.addOutput("A-B");
nodesEngine.add(node_math);

let node_watch =  Nodes.createNode("basic/console");
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



console.log("ok");

