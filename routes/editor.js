/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'express', "../public/nodes/container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require('express');
    const container_1 = require("../public/nodes/container");
    let router = express.Router();
    let config = require('./../config');
    router.get('/', function (req, res) {
        res.render('editor/index', {
            split: req.query.split,
            container_id: 0,
            theme: config.nodeEditor.theme
        });
    });
    router.get('/c/:cid', function (req, res) {
        let cid = req.params.cid || 0;
        if (!container_1.Container.containers[cid]) {
            res.redirect("/");
            return;
        }
        res.render('editor/index', {
            split: req.query.split,
            container_id: cid,
            theme: config.nodeEditor.theme
        });
    });
    router.get('/c/:cid/n/:id*', function (req, res) {
        let cont = container_1.Container.containers[req.params.cid];
        if (!cont)
            return res.status(404).send(`Can't send request to node. Container id [${req.params.cid}] not found.`);
        let node = cont.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] not found.`);
        if (node['onGetRequest'])
            node['onGetRequest'](req, res);
        else
            return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] does not accept requests.`);
    });
    router.post('/c/:cid/n/:id*', function (req, res) {
        let cont = container_1.Container.containers[req.params.cid];
        if (!cont)
            return res.status(404).send(`Can't send request to node. Container id [${req.params.cid}] not found.`);
        let node = cont.getNodeById(req.params.id);
        if (!node)
            return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] not found.`);
        if (node['onPostRequest'])
            node['onPostRequest'](req, res);
        else
            return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] does not accept requests.`);
    });
    router.get('/container', function (req, res) {
        // //todo if (rootContainer.isNotStarted)
        // //	res.render("Error", "Root container is not started.<br/><br/>   <a href='/Config'>Check settings</a>");
        //
        // if (!req.query.id || req.query.id == 0)
        // 	res.redirect("/editor");
        //
        // let container = app.rootContainer.getContainerNode(req.query.id);
        // if (!container)
        // 	res.status(404).send('Container not found!');
        //
        // let containerStack = {};
        // let p = container;
        // while (true) {
        // 	containerStack[p.id] = p.name;
        // 	if (p.containerId == 0)
        // 		break;
        // 	p = app.rootContainer.getContainerNode(p.containerId);
        // }
        //
        // res.render('editor/index', {
        // 	split: req.query.split,
        // 	containerId: container.id,
        // 	ownerContainerId: container.containerId,
        // 	containersStack: containerStack,
        // 	theme: config.nodeEditor.theme
        // });
    });
    router.get('/split', function (req, res) {
        //todo if (rootContainer.isNotStarted)
        //	res.render("Error", "Root container is not started.<br/><br/>   <a href='/Config'>Check settings</a>");
        let route = req.query.id ? "container/" + req.query.id : "";
        res.render('editor/split', { route: route });
    });
    router.get('/NodesDescription', function (req, res) {
        //todo
    });
    module.exports = router;
});
//# sourceMappingURL=editor.js.map