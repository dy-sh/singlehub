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
    router.get('/containers/:id', function (req, res) {
        console.log(req.params.id);
        let s = nodes_engine_1.engine.serialize();
        res.json(s);
    });
    router.get('/containers/serialize', function (req, res) {
    });
    router.get('/containers/serialize-file', function (req, res) {
    });
    router.post('/containers/import', function (req, res) {
    });
    //------------------ nodes ------------------------
    router.post('/nodes', function (req, res) {
        let contId = req.body.container;
        let node = nodes_1.Nodes.createNode(req.body.type);
        node.pos = req.body.position;
        nodes_engine_1.engine.add(node);
        //let n =node.serialize();
        let n = { id: node.id,
            type: node.type,
            pos: node.pos };
        server_1.default.socket.io.emit('new-node', JSON.stringify(n));
        utils_1.default.debug("New node added: " + node.type);
    });
    router.post('/nodes/clone/:id', function (req, res) {
    });
    router.delete('/nodes/:id', function (req, res) {
    });
    router.put('/nodes', function (req, res) {
        let newNode = JSON.parse(req.body.node);
        // console.log(newNode);
        let node = nodes_engine_1.engine._nodes.find(n => n.id === newNode.id);
        node.pos = newNode.pos;
        server_1.default.socket.io.emit('node-position', { id: node.id, pos: node.pos });
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