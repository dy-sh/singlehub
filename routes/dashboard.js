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
    //var config = require('./../config');
    router.get('/', function (req, res, next) {
        // res.redirect("/editor")
        res.render('dashboard/index');
    });
    router.get('/c/:cid', function (req, res, next) {
        if (req.params.cid == 0)
            res.redirect("/dashboard/");
        else
            res.render('dashboard/index');
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
    module.exports = router;
});
//# sourceMappingURL=dashboard.js.map