/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

var express = require('express');
var router = express.Router();
var config = require('./../config');
var engine = require('./../public/nodes/nodes-engine');

var MAIN_PANEL_ID = "Main";

router.get('/', function (req, res) {

	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");


	res.render('NodeEditor/index', {
		split: req.query.split,
		panelId: MAIN_PANEL_ID,
		theme: config.nodeEditor.theme
	});
});


router.get('/Panel', function (req, res) {

	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");

	if (!req.query.id || req.query.id == MAIN_PANEL_ID)
		res.redirect("/NodeEditor");

	var panel = engine.getPanelNode(req.query.id);
	if (!panel)
		res.status(404).send('Panel not found!');

	var panelsStack = {};
	var p = panel;
	while (true) {
		panelsStack[p.id] = p.name;
		if (p.panelId == MAIN_PANEL_ID)
			break;
		p = engine.getPanelNode(p.panelId);
	}

	res.render('NodeEditor/index', {
		split: req.query.split,
		panelId: panel.id,
		ownerPanelId: panel.panelId,
		panelsStack: panelsStack,
		theme: config.nodeEditor.theme
	});
});


router.get('/Split', function (req, res) {
	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");

	var route = req.query.id ? "Panel/" + req.query.id : "";

	res.render('NodeEditor/split', {route: route});
});


router.get('/NodesDescription', function (req, res) {
	//todo
});

module.exports = router;