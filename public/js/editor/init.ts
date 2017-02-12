/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */

import {Nodes} from "../../nodes/nodes"
import {Node} from "../../nodes/node"
import {rootContainer, Container} from "../../nodes/container"

import "../../nodes/nodes/main";
import "../../nodes/nodes/debug";
import "../../nodes/nodes/math";

import {editor} from "./node-editor";
import {socket} from "./editor-socket"






(<any>window).rootContainer = rootContainer;
(<any>window).editor = editor;
(<any>window).Nodes = Nodes;
(<any>window).Container = Container;
(<any>window).renderer = editor.renderer;
// socket.container_id=editor.renderer.container.container_id;

window.addEventListener("resize", function () {
    editor.renderer.resize();
});

socket.getNodes();
socket.getContainerState();

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


