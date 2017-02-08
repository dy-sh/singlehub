/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'express', "../public/nodes/nodes-engine", "../modules/web-server/server", "../public/nodes/nodes", "../public/nodes/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require('express');
    let router = express.Router();
    const nodes_engine_1 = require("../public/nodes/nodes-engine");
    const server_1 = require("../modules/web-server/server");
    const nodes_1 = require("../public/nodes/nodes");
    const utils_1 = require("../public/nodes/utils");
    let MODULE_NAME = "SOCKET";
    setInterval(updateActiveNodes, 100);
    function updateActiveNodes() {
        let activeNodesIds = [];
        for (let node of nodes_engine_1.engine._nodes) {
            if (node.isActive) {
                node.isActive = false;
                activeNodesIds.push(node.id);
            }
        }
        server_1.server.socket.io.emit('nodes-active', { ids: activeNodesIds, cid: nodes_engine_1.engine.container_id });
    }
    //------------------ info ------------------------
    router.get('/info', function (req, res) {
    });
    //------------------ containers ------------------------
    /**
     * Get container
     */
    router.get('/c/:id', function (req, res) {
        let s = nodes_engine_1.engine.serialize();
        res.json(s);
    });
    router.get('/c/serialize', function (req, res) {
    });
    router.get('/c/serialize-file', function (req, res) {
    });
    router.post('/c/import', function (req, res) {
    });
    //------------------ nodes ------------------------
    /**
     * Create node
     */
    router.post('/c/:cid/n/', function (req, res) {
        let container = nodes_engine_1.NodesEngine.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Cant create node. Container id [${req.params.cid}] not found.`);
        let node = nodes_1.Nodes.createNode(req.body.type);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Cant create node. Node type [${req.body.type}] not found.`);
        node.pos = req.body.position;
        container.add(node);
        server_1.server.socket.io.emit('node-create', {
            id: node.id,
            cid: req.params.cid,
            type: node.type,
            pos: node.pos
        });
        res.send(`${MODULE_NAME}: New node created: type [${node.type}] id [${node.container_id}/${node.id}]`);
    });
    /**
     * Delete node
     */
    router.delete('/c/:cid/n/:id', function (req, res) {
        let container = nodes_engine_1.NodesEngine.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Cant delete node. Container id [${req.params.cid}] not found.`);
        let node = container.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Cant delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);
        container.remove(node);
        server_1.server.socket.io.emit('node-delete', {
            id: req.params.id,
            cid: req.params.cid,
        });
        res.send(`${MODULE_NAME}: Node deleted: type [${node.type}] id [${node.container_id}/${node.id}]`);
    });
    /**
     * Delete nodes
     */
    router.delete('/c/:cid/n/', function (req, res) {
        let container = nodes_engine_1.NodesEngine.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Cant delete node. Container id [${req.params.cid}] not found.`);
        for (let id of req.body) {
            let node = nodes_engine_1.engine.getNodeById(id);
            if (!node)
                return res.status(404).send(`${MODULE_NAME}: Cant delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);
            nodes_engine_1.engine.remove(node);
        }
        server_1.server.socket.io.emit('nodes-delete', {
            nodes: req.body,
            cid: req.params.cid
        });
        res.send(`${MODULE_NAME}: Nodes deleted: ids ${req.params.cid}/${JSON.stringify(req.body.ids)}`);
    });
    /**
     * Update node position
     */
    router.put('/c/:cid/n/:id/position', function (req, res) {
        let container = nodes_engine_1.NodesEngine.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Cant update node position. Container id [${req.params.cid}] not found.`);
        let node = container.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Cant update node position. Node id [${req.params.cid}/${req.params.id}] not found.`);
        node.pos = req.body.position;
        server_1.server.socket.io.emit('node-update-position', {
            id: req.params.id,
            cid: req.params.cid,
            pos: node.pos
        });
        res.send(`${MODULE_NAME}: Node position updated: type [${node.type}] id [${node.container_id}/${node.id}]`);
    });
    /**
     * Update node size
     */
    router.put('/c/:cid/n/:id/size', function (req, res) {
        let container = nodes_engine_1.NodesEngine.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Cant update node size. Container id [${req.params.cid}] not found.`);
        let node = container.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Cant update node size. Node id [${req.params.cid}/${req.params.id}] not found.`);
        node.size = req.body.size;
        server_1.server.socket.io.emit('node-update-size', {
            id: req.params.id,
            cid: req.params.cid,
            size: node.size
        });
        res.send(`${MODULE_NAME}: Node size updated: type [${node.type}] id [${node.container_id}/${node.id}]`);
    });
    router.post('/nodes/clone/:id', function (req, res) {
    });
    router.post('/nodes/settings/:id', function (req, res) {
    });
    router.delete('/nodes/all', function (req, res) {
    });
    router.get('/nodes/description', function (req, res) {
    });
    //------------------ links ------------------------
    /**
     * create link
     */
    router.post('/c/:cid/l/', function (req, res) {
        let cont = req.params.cid;
        let link = req.body;
        let node = nodes_engine_1.engine.getNodeById(link.origin_id);
        let targetNode = nodes_engine_1.engine.getNodeById(link.target_id);
        if (!node) {
            utils_1.default.debugErr("Cant create link. Origin node id does not exist.", MODULE_NAME);
            res.status(404).send("Cant create link. Origin node id does not exist.");
            return;
        }
        if (!targetNode) {
            utils_1.default.debugErr("Cant create link. Target node id does not exist.", MODULE_NAME);
            res.status(404).send("Cant create link. Target node id does not exist.");
            return;
        }
        // let input = targetNode.getInputInfo(0);
        //prevent connection of different types
        // if (input && !input.link && input.type == this.connecting_output.type) { //toLowerCase missing
        //if user drag to node instead of slot
        if (link.target_slot == -1) {
            //todo find free input
            let input = targetNode.getInputInfo(0);
            if (input == null) {
                //no inputs
                utils_1.default.debugErr("Cant create link. No free inputs.", MODULE_NAME);
                res.status(404).send("Cant create link. No free inputs.");
                return;
            }
            link.target_slot = 0;
        }
        // node.disconnectOutput(link.origin_slot, targetNode);
        // targetNode.disconnectInput(link.target_slot);
        node.connect(link.origin_slot, targetNode, link.target_slot);
        server_1.server.socket.io.emit('link-create', req.body);
        utils_1.default.debug("Link created");
        res.send("Link created");
    });
    /**
     * delete link
     */
    router.delete('/c/:cid/l/:id', function (req, res) {
        let cont = req.params.cid;
        let id = req.params.id;
        let link = nodes_engine_1.engine.links[id];
        let node = nodes_engine_1.engine.getNodeById(link.origin_id);
        let targetNode = nodes_engine_1.engine.getNodeById(link.target_id);
        if (!node) {
            utils_1.default.debugErr("Cant delete link. Origin node id does not exist.", MODULE_NAME);
            res.status(404).send("Cant delete link. Origin node id does not exist.");
            return;
        }
        if (!targetNode) {
            utils_1.default.debugErr("Cant delete link. Target node id does not exist.", MODULE_NAME);
            res.status(404).send("Cant delete link. Target node id does not exist.");
            return;
        }
        // node.disconnectOutput(link.origin_slot, targetNode);
        targetNode.disconnectInput(link.target_slot);
        server_1.server.socket.io.emit('link-delete', {
            id: link.id,
            container: nodes_engine_1.engine.container_id
        });
        utils_1.default.debug("Link deleted");
        res.send("Link deleted");
    });
    //------------------ receiver ------------------------
    router.post('/receiver/value', function (req, res) {
    });
    module.exports = router;
});
//# sourceMappingURL=api-editor.js.map