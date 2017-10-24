/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
import app from "../../app";
import { Container } from "../../nodes/container";


let router = express.Router();
let config = require('../../../config.json');


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

    let cid = req.params.cid || 0;

    if (!Container.containers[cid])
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

    let cid = req.params.cid || 0;

    if (!Container.containers[cid])
        return res.redirect("/editor/split");

    res.render('editor/split', { container_id: cid });
});


module.exports = router;