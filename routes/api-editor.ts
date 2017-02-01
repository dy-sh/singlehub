/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
let router = express.Router();

import {engine} from "../public/nodes/nodes-engine"
import server from "../modules/web-server/server"
import {Nodes} from "../public/nodes/nodes";
import Utils from "../public/nodes/utils";



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
	let contId=req.body.container;

	let node = Nodes.createNode(req.body.type);
	node.pos = req.body.position;
	engine.add(node);

	//let n =node.serialize();
	let n={id: node.id,
		type: node.type,
		pos: node.pos};

	server.socket.io.emit('new-node', JSON.stringify(n));

	Utils.debug("New node added: "+node.type);
});

router.post('/nodes/clone/:id', function (req, res) {

});

router.delete('/nodes/:id', function (req, res) {

});



router.put('/nodes', function (req, res) {
	let newNode = JSON.parse(req.body.node);
	// console.log(newNode);
	let node = engine._nodes.find(n => n.id === newNode.id);
	node.pos=newNode.pos;

	server.socket.io.emit('node-position', {id:node.id,pos:node.pos});
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