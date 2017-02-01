/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
//import {NodesEngine as engine} from './../public/nodes/nodes-engine');
var engine = require('./../public/nodes/nodes-engine');


var router = express.Router();
var config = require('./../config');


router.get('/', function (req, res) {

	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");


	res.render('editor/index', {
		split: req.query.split,
		containerId: 0,
		theme: config.nodeEditor.theme
	});
});


router.get('/container', function (req, res) {

	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");

	if (!req.query.id || req.query.id == 0)
		res.redirect("/editor");

	var container = engine.getContainerNode(req.query.id);
	if (!container)
		res.status(404).send('Container not found!');

	var containerStack = {};
	var p = container;
	while (true) {
		containerStack[p.id] = p.name;
		if (p.containerId == 0)
			break;
		p = engine.getContainerNode(p.containerId);
	}

	res.render('editor/index', {
		split: req.query.split,
		containerId: container.id,
		ownerContainerId: container.containerId,
		containersStack: containerStack,
		theme: config.nodeEditor.theme
	});
});


router.get('/split', function (req, res) {
	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");

	var route = req.query.id ? "container/" + req.query.id : "";

	res.render('editor/split', {route: route});
});


router.get('/NodesDescription', function (req, res) {
	//todo
});

module.exports = router;