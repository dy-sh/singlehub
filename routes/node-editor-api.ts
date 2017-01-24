/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
let router = express.Router();

//var nodesEngine = require('../modules/nodes/nodes-engine');
//var uiNodesEngine = require('../modules/nodes/ui-nodes-engine');
//var config = require('./../config');

// import App from '../modules/web-server/server'
import {engine} from "../public/nodes/nodes-engine"

router.get('/GetNodesForPanel', function (req, res) {
	let s=engine.serialize();
	res.json(s);
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
	let newNode = JSON.parse(req.body.node);
	// console.log(newNode);
	let node = engine._nodes.find(n => n.id === newNode.id);
	node.pos=newNode.pos;
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