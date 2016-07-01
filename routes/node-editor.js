/**
 * Created by Derwish on 02.07.2016.
 */

var express = require('express');
var router = express.Router();
var config = require('./../config');
var engine = require('../modules/nodes/nodes-engine');

var MAIN_PANEL_ID = "Main";

router.get('/', function (req, res) {

	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");


	res.render('node-editor', {
		split: req.params.split,
		panelId: MAIN_PANEL_ID,
		theme: config.nodeEditor.theme
	});
});


router.get('/Panel', function (req, res) {

	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");

	if (!req.params.panelId || req.params.panelId == MAIN_PANEL_ID)
		res.redirect("/NodeEditor");

	var panel = engine.getPanelNode(req.params.panelId);
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

	res.render('node-editor', {
		split: req.params.split,
		panelId: panel.Id,
		ownerPanelId: panel.panelId,
		panelsStack: panelsStack,
		theme: config.nodeEditor.theme
	});
});


router.get('/Split', function (req, res) {
	//todo if (engine.isNotStarted)
	//	res.render("Error", "Nodes Engine is not started.<br/><br/>   <a href='/Config'>Check settings</a>");

	var route = req.params.panelId ? "Panel/" + req.params.panelId : "";

	res.render('split', {route: route});
});


router.get('/NodesDescription', function (req, res) {
	//todo
});

module.exports = router;