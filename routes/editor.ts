/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
import {app} from "../app";
import {Container} from "../public/nodes/container";


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
    if (!Container.containers[cid]){
        res.redirect("/");
        return;
    }


    res.render('editor/index', {
        split: req.query.split,
        container_id: cid,
        theme: config.nodeEditor.theme
    });
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

    res.render('editor/split', {route: route});
});


router.get('/NodesDescription', function (req, res) {
    //todo
});

module.exports = router;