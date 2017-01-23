/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'express', '../modules/web-server/server'], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require('express');
    let router = express.Router();
    //var nodesEngine = require('../modules/nodes/nodes-engine');
    //var uiNodesEngine = require('../modules/nodes/ui-nodes-engine');
    //var config = require('./../config');
    const server_1 = require('../modules/web-server/server');
    router.get('/GetNodesForPanel', function (req, res) {
        res.json(server_1.default.server.address().port);
    });
    router.get('/ConvertNodeToLiteGraphNode', function (req, res) {
    });
    router.get('/ConvertLinkToLiteGraphLink', function (req, res) {
    });
    router.get('/GetLinks', function (req, res) {
    });
    router.post('/RemoveLink', function (req, res) {
    });
    router.post('/CreateLink', function (req, res) {
    });
    router.post('/AddNode', function (req, res) {
        console.log(req.body);
    });
    router.post('/CloneNode', function (req, res) {
    });
    router.post('/RemoveNode', function (req, res) {
    });
    router.post('/RemoveNodes', function (req, res) {
    });
    router.post('/UpdateNode', function (req, res) {
    });
    router.post('/SetNodeSettings', function (req, res) {
    });
    router.get('/SerializePanel', function (req, res) {
    });
    router.get('/SerializePanelToFile', function (req, res) {
    });
    router.post('/ImportPanelJson', function (req, res) {
    });
    router.get('/GetNodesEngineInfo', function (req, res) {
    });
    router.post('/RemoveAllNodesAndLinks', function (req, res) {
    });
    router.get('/GetNodeDescription', function (req, res) {
    });
    router.post('/ReceiverSetValue', function (req, res) {
    });
    module.exports = router;
});
//# sourceMappingURL=node-editor-api.js.map