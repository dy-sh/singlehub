/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'express', "../public/nodes/container", "../modules/web-server/server", "../public/nodes/nodes", "../modules/database"], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require('express');
    let router = express.Router();
    const container_1 = require("../public/nodes/container");
    const server_1 = require("../modules/web-server/server");
    const nodes_1 = require("../public/nodes/nodes");
    const database_1 = require("../modules/database");
    let MODULE_NAME = "SOCKET";
    setInterval(updateActiveNodes, 100);
    function updateActiveNodes() {
        let container = container_1.rootContainer;
        let activeNodesIds = [];
        for (let id in container._nodes) {
            let node = container._nodes[id];
            if (node.isActive) {
                node.isActive = false;
                activeNodesIds.push(node.id);
            }
        }
        server_1.server.socket.io.emit('nodes-active', { ids: activeNodesIds, cid: container_1.rootContainer.id });
    }
    //------------------ info ------------------------
    router.get('/info', function (req, res) {
    });
    //------------------ containers ------------------------
    /**
     * Get container
     */
    router.get('/c/:id', function (req, res) {
        let s = container_1.rootContainer.serialize();
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
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't create node. Container id [${req.params.cid}] not found.`);
        let node = nodes_1.Nodes.createNode(req.body.type);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Can't create node. Node type [${req.body.type}] not found.`);
        node.pos = req.body.position;
        container.add(node);
        server_1.server.socket.io.emit('node-create', {
            id: node.id,
            cid: req.params.cid,
            type: node.type,
            pos: node.pos,
            properties: node.properties
        });
        if (node.onCreated)
            node.onCreated();
        //insert to db
        database_1.db.addNode(node);
        //update container in db
        database_1.db.updateContainer(container.id, { last_node_id: container.last_node_id });
        //add container new to db
        if (node.sub_container) {
            database_1.db.addContainer(node.sub_container);
        }
        res.send(`${MODULE_NAME}: New node created: type [${node.type}] id [${node.container.id}/${node.id}]`);
    });
    /**
     * Delete node
     */
    router.delete('/c/:cid/n/:id', function (req, res) {
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't delete node. Container id [${req.params.cid}] not found.`);
        let node = container.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Can't delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);
        container.remove(node);
        server_1.server.socket.io.emit('node-delete', {
            id: req.params.id,
            cid: req.params.cid,
        });
        res.send(`${MODULE_NAME}: Node deleted: type [${node.type}] id [${container.id}/${node.id}]`);
    });
    /**
     * Delete nodes
     */
    router.delete('/c/:cid/n/', function (req, res) {
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't delete node. Container id [${req.params.cid}] not found.`);
        for (let id of req.body) {
            let node = container.getNodeById(id);
            if (!node)
                return res.status(404).send(`${MODULE_NAME}: Can't delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);
            container.remove(node);
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
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't update node position. Container id [${req.params.cid}] not found.`);
        let node = container.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Can't update node position. Node id [${req.params.cid}/${req.params.id}] not found.`);
        node.pos = req.body.position;
        server_1.server.socket.io.emit('node-update-position', {
            id: req.params.id,
            cid: req.params.cid,
            pos: node.pos
        });
        res.send(`${MODULE_NAME}: Node position updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
    });
    /**
     * Update node size
     */
    router.put('/c/:cid/n/:id/size', function (req, res) {
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't update node size. Container id [${req.params.cid}] not found.`);
        let node = container.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Can't update node size. Node id [${req.params.cid}/${req.params.id}] not found.`);
        node.size = req.body.size;
        server_1.server.socket.io.emit('node-update-size', {
            id: req.params.id,
            cid: req.params.cid,
            size: node.size
        });
        res.send(`${MODULE_NAME}: Node size updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
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
     * Create link
     */
    router.post('/c/:cid/l/', function (req, res) {
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't create link. Container id [${req.params.cid}] not found.`);
        let link = req.body;
        let node = container.getNodeById(link.origin_id);
        let targetNode = container.getNodeById(link.target_id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Can't create link. Node id [${req.params.cid}/${link.origin_id}] not found.`);
        if (!targetNode)
            return res.status(404).send(`${MODULE_NAME}: Can't create link. Node id [${req.params.cid}/${link.target_id}] not found.`);
        // let input = targetNode.getInputInfo(0);
        //prevent connection of different types
        // if (input && !input.link && input.type == this.connecting_output.type) { //toLowerCase missing
        //if user drag to node instead of slot
        if (link.target_slot == -1) {
            //todo find free input
            let input = targetNode.getInputInfo(0);
            if (!input)
                return res.status(404).send(`${MODULE_NAME}: Can't create link. Node id [${req.params.cid}/${link.target_id}] has no free inputs.`);
            link.target_slot = 0;
        }
        // node.disconnectOutput(link.origin_slot, targetNode);
        // targetNode.disconnectInput(link.target_slot);
        node.connect(link.origin_slot, targetNode, link.target_slot);
        server_1.server.socket.io.emit('link-create', {
            cid: req.params.cid,
            link: req.body
        });
        res.send(`${MODULE_NAME}: Link created: from [${node.container.id}/${node.id}] to [${targetNode.container.id}/${targetNode.id}]`);
    });
    /**
     * Delete link
     */
    router.delete('/c/:cid/l/:id', function (req, res) {
        let container = container_1.Container.containers[req.params.cid];
        if (!container)
            return res.status(404).send(`${MODULE_NAME}: Can't create link. Container id [${req.params.cid}] not found.`);
        let link = container._links[req.params.id];
        let node = container.getNodeById(link.origin_id);
        let targetNode = container.getNodeById(link.target_id);
        if (!node)
            return res.status(404).send(`${MODULE_NAME}: Can't create link. Node id [${req.params.cid}/${link.origin_id}] not found.`);
        if (!targetNode)
            return res.status(404).send(`${MODULE_NAME}: Can't create link. Node id [${req.params.cid}/${link.target_id}] not found.`);
        // node.disconnectOutput(link.origin_slot, targetNode);
        targetNode.disconnectInput(link.target_slot);
        server_1.server.socket.io.emit('link-delete', {
            cid: req.params.cid,
            id: req.params.id
        });
        res.send(`${MODULE_NAME}: Link deleted: from [${node.container.id}/${node.id}] to [${targetNode.container.id}/${targetNode.id}]`);
    });
    //------------------ Container ------------------------
    /**
     * Run step container
     */
    router.get('/state', function (req, res) {
        let state = {
            isRunning: container_1.rootContainer.isRunning
        };
        res.json(state);
    });
    /**
     * Run container
     */
    router.post('/run', function (req, res) {
        container_1.rootContainer.run();
        server_1.server.socket.io.emit('container-run');
        res.send(`${MODULE_NAME}: Run container`);
    });
    /**
     * Stop container
     */
    router.post('/stop', function (req, res) {
        container_1.rootContainer.stop();
        server_1.server.socket.io.emit('container-stop');
        res.send(`${MODULE_NAME}: Stop container`);
    });
    /**
     * Run step container
     */
    router.post('/step', function (req, res) {
        container_1.rootContainer.runStep();
        server_1.server.socket.io.emit('container-run-step');
        res.send(`${MODULE_NAME}: Run step container`);
    });
    //------------------ receiver ------------------------
    router.post('/receiver/value', function (req, res) {
    });
    module.exports = router;
});
//# sourceMappingURL=api-editor.js.map