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
import server from "../modules/web-server/server"



//------------------ info ------------------------

router.get('/info', function (req, res) {

});
//------------------ containers ------------------------

router.get('/containers/:id', function (req, res) {
	console.log(req.params.id);
	let s=engine.serialize();
	res.json(s);
});


router.get('/containers/serialize', function (req, res) {

});

router.get('/containers/serialize-file', function (req, res) {

});

router.post('/containers/import', function (req, res) {

});


//------------------ nodes ------------------------




router.post('/nodes', function (req, res) {
	console.log(req.body);
});

router.post('/nodes/clone/:id', function (req, res) {

});

router.delete('/nodes/:id', function (req, res) {

});

router.post('/nodes', function (req, res) {

});

router.put('/nodes', function (req, res) {
	let newNode = JSON.parse(req.body.node);
	// console.log(newNode);
	let node = engine._nodes.find(n => n.id === newNode.id);
	node.pos=newNode.pos;

	server.socket.io.emit('node position update', {id:node.id,pos:node.pos});
});

router.post('/nodes/settings/:id', function (req, res) {

});



router.delete('/nodes/all', function (req, res) {

});

router.get('/nodes/description', function (req, res) {

});

//------------------ links ------------------------


router.get('/links', function (req, res) {

});


router.delete('/links/:id', function (req, res) {

});

router.post('/links', function (req, res) {

});

//------------------ receiver ------------------------




router.post('/receiver/value', function (req, res) {

});


module.exports = router;