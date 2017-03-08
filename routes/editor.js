/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var express = require('express');
var container_1 = require("../public/nodes/container");
var router = express.Router();
var config = require('./../config');
router.get('/', function (req, res) {
    res.render('editor/index', {
        split: req.query.split,
        container_id: 0,
        theme: config.nodeEditor.theme
    });
});
router.get('/c/:cid', function (req, res) {
    // if (req.params.cid == 0)
    //     return res.redirect("/editor");
    var cid = req.params.cid || 0;
    if (!container_1.Container.containers[cid])
        return res.redirect("/editor");
    res.render('editor/index', {
        split: req.query.split,
        container_id: cid,
        theme: config.nodeEditor.theme
    });
});
router.get('/split', function (req, res) {
    res.render('editor/split', { container_id: 0 });
});
router.get('/split/c/:cid', function (req, res) {
    // if (req.params.cid == 0)
    //     return res.redirect("/editor/split");
    var cid = req.params.cid || 0;
    if (!container_1.Container.containers[cid])
        return res.redirect("/editor/split");
    res.render('editor/split', { container_id: cid });
});
module.exports = router;
