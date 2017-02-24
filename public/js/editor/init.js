/**
 * Created by Derwish (derwish.pro@gmail.com) on 22.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes", "../../nodes/container", "../../nodes/nodes/main", "../../nodes/nodes/debug", "../../nodes/nodes/math", "./node-editor"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const container_1 = require("../../nodes/container");
    require("../../nodes/nodes/main");
    require("../../nodes/nodes/debug");
    require("../../nodes/nodes/math");
    const node_editor_1 = require("./node-editor");
    window.rootContainer = container_1.Container.containers[0];
    window.Nodes = nodes_1.Nodes;
    window.Container = container_1.Container;
    window.renderer = node_editor_1.editor.renderer;
    window.editor = node_editor_1.editor;
    // socket.container_id=editor.renderer.container.container_id;
    window.addEventListener("resize", function () {
        node_editor_1.editor.renderer.resize();
    });
    node_editor_1.editor.getNodes();
});
//# sourceMappingURL=init.js.map