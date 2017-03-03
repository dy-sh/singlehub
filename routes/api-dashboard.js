/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "express", "../public/nodes/container", "../app"], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require("express");
    let router = express.Router();
    const container_1 = require("../public/nodes/container");
    const app_1 = require("../app");
    setInterval(updateActiveNodes, 300);
    function updateActiveNodes() {
        if (!app_1.app.rootContainer)
            return;
        for (let c in container_1.Container.containers) {
            let container = container_1.Container.containers[c];
            let activeNodesIds = [];
            for (let id in container._nodes) {
                let node = container._nodes[id];
                if (node.isRecentlyActive) {
                    node.isRecentlyActive = false;
                    activeNodesIds.push(node.id);
                }
            }
            if (activeNodesIds.length > 0)
                app_1.app.server.editorSocket.io.in("" + container.id).emit('nodes-active', { ids: activeNodesIds, cid: container.id });
        }
    }
    /**
     * Get container
     */
    router.get('/c/:cid', function (req, res) {
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`Can't get container. Container id [${req.params.cid}] not found.`);
        let s = container.serialize(true, true);
        res.json(s);
    });
    module.exports = router;
});
//# sourceMappingURL=api-dashboard.js.map