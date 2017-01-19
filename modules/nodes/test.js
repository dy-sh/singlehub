/**
 * Created by Derwish on 04.07.2016.
 */

var nodesEngine = require('./nodes-engine');
var nodes = require('./nodes');

module.exports.test = function () {

	//graph.start(1);

	setInterval(function () {
		nodesEngine.runStep(1);
	}, 2000);

	var node_const_A = nodes.createNode("basic/const");
	node_const_A.pos = [200, 200];
	nodesEngine.add(node_const_A);
	node_const_A.setValue(4.5);

	var node_const_B = nodes.createNode("basic/const");
	node_const_B.pos = [200, 300];
	nodesEngine.add(node_const_B);
	node_const_B.setValue(10);

	var node_math = nodes.createNode("math/operation");
	node_math.pos = [400, 200];
	node_math.addOutput("A*B");
	nodesEngine.add(node_math);

	var node_watch = nodes.createNode("basic/console");
	node_watch.pos = [700, 200];
	nodesEngine.add(node_watch);

	var node_watch2 = nodes.createNode("basic/console");
	node_watch2.pos = [700, 300];
	nodesEngine.add(node_watch2);

	node_const_A.connect(0, node_math, 0);
	node_const_B.connect(0, node_math, 1);
	node_math.connect(0, node_watch, 0);
	node_math.connect(0, node_watch2, 0);


};


