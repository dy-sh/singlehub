/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import {Nodes as nodes, Node} from "../public/nodes/nodes";
import {engine} from "../public/nodes/nodes-engine";


module.exports.test = function () {

	//engine.start(1);

	let node_const_A = nodes.createNode("basic/const");
	node_const_A.pos = [10, 10];
	engine.add(node_const_A);
	node_const_A.setValue(5);

	let node_const_B = nodes.createNode("basic/const");
	node_const_B.pos = [10, 100];
	engine.add(node_const_B);
	node_const_B.setValue(10);

	let node_math = nodes.createNode("math/operation");
	node_math.pos = [200, 50];
	node_math.properties.OP="-";
	node_math.addOutput("A-B");
	engine.add(node_math);

	let node_watch = nodes.createNode("debug/console");
	node_watch.pos = [400, 50];
	engine.add(node_watch);

	// let node_watch2 = nodes.createNode("basic/console");
	// node_watch2.pos = [700, 300];
	// engine.add(node_watch2);


    node_const_A.connect(0, node_math, 0);
    node_const_B.connect(0, node_math, 1);
    node_math.connect(0, node_watch, 0);
	// node_math.connect(0, node_watch2, 0);

	engine.runStep(1);

	setInterval(function () {
		engine.runStep(1);
	}, 1000);
};


