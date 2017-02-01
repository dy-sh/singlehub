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
    //------------------ info ------------------------
    router.get('/info', function (req, res) {
    });
    //------------------ containers ------------------------
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
     * create node
     */
    router.post('/c/:cid/n/', function (req, res) {
        let cont = req.params.cid;
        let node = nodes_1.Nodes.createNode(req.body.type);
        if (!node) {
            utils_1.default.debugErr("Cant create node. Check node type.", "Socket");
            res.status(404).send("Cant create node. Check node type.");
            return;
        }
        node.pos = req.body.position;
        nodes_engine_1.engine.add(node);
        //let n =node.serialize();
        let n = {
            id: node.id,
            type: node.type,
            pos: node.pos
        };
        server_1.default.socket.io.emit('node-create', JSON.stringify(n));
        utils_1.default.debug("New node created: " + node.type);
        res.send("New node created: " + node.type);
    });
    router.post('/nodes/clone/:id', function (req, res) {
    });
    /**
     * delete node
     */
    router.delete('/c/:cid/n/:nid', function (req, res) {
        let cont = req.params.cid;
        let id = req.params.nid;
        let node = nodes_engine_1.engine.getNodeById(id);
        if (!node) {
            utils_1.default.debugErr("Cant delete node. Node id does not exist.", "Socket");
            res.status(404).send("Cant delete node. Node id does not exist.");
            return;
        }
        //let node = engine._nodes.find(n => n.id === id);
        nodes_engine_1.engine.remove(node);
        var data = JSON.stringify({ id: node.id, container: nodes_engine_1.engine.container_id });
        server_1.default.socket.io.emit('node-delete', data);
        utils_1.default.debug("Node deleted: " + node.type);
        res.send("Node deleted: " + node.type);
    });
    /**
     * node update position
     */
    router.put('/nodes', function (req, res) {
        let newNode = JSON.parse(req.body.node);
        // console.log(newNode);
        let node = nodes_engine_1.engine._nodes.find(n => n.id === newNode.id);
        node.pos = newNode.pos;
        server_1.default.socket.io.emit('node-update-position', { id: node.id, pos: node.pos });
        res.send("ok");
    });
    router.post('/nodes/settings/:id', function (req, res) {
    });
    router.delete('/nodes/all', function (req, res) {
    });
    router.get('/nodes/description', function (req, res) {
    });
    //------------------ links ------------------------
    router.get('/links', function (req, res) {
    });
    router.delete('/links/:id', function (req, res) {
    });
    router.post('/links', function (req, res) {
    });
    //------------------ receiver ------------------------
    router.post('/receiver/value', function (req, res) {
    });
    module.exports = router;
});
//# sourceMappingURL=api-editor.js.map