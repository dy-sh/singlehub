/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */
"use strict";
var nodes_1 = require("../../nodes/nodes");
var container_1 = require("../../nodes/container");
require("../../nodes/nodes/main");
require("../../nodes/nodes/debug");
require("../../nodes/nodes/math");
var editor_1 = require("./editor");
window.rootContainer = container_1.Container.containers[0];
window.Nodes = nodes_1.Nodes;
window.Container = container_1.Container;
window.renderer = editor_1.editor.renderer;
window.editor = editor_1.editor;
// socket.container_id=editor.renderer.container.container_id;
window.addEventListener("resize", function () {
    editor_1.editor.renderer.resize();
});
editor_1.editor.getNodes();
