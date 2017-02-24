/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */

import {Nodes} from "../../nodes/nodes"
import {Node} from "../../nodes/node"
import {Container} from "../../nodes/container"

import "../../nodes/nodes/main";
import "../../nodes/nodes/debug";
import "../../nodes/nodes/math";

import {socket} from "./editor-socket"

import {editor} from "./node-editor";

(<any>window).rootContainer = Container.containers[0];
(<any>window).Nodes = Nodes;
(<any>window).Container = Container;
(<any>window).renderer = editor.renderer;
(<any>window).editor = editor;
// socket.container_id=editor.renderer.container.container_id;

window.addEventListener("resize", function () {
    editor.renderer.resize();
});


editor.getNodes();
