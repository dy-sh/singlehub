/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import {Nodes} from "../public/nodes/nodes";
import {app} from "../app";

let rootContainer = app.rootContainer;

module.exports.test = function () {

    //rootContainer.start(1);

    let node_const_A = Nodes.createNode("main/constant");
    node_const_A.pos = [10, 10];
    rootContainer.add(node_const_A);
    node_const_A.setValue(5.4);

    let node_const_B = Nodes.createNode("main/constant");
    node_const_B.pos = [10, 100];
    rootContainer.add(node_const_B);
    node_const_B.setValue(10);

    let node_math = Nodes.createNode("math/plus");
    node_math.pos = [200, 50];
    rootContainer.add(node_math);

    let node_watch = Nodes.createNode("debug/console");
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


