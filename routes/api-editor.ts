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

router.get('/c/:id', function (req, res) {
    let s = engine.serialize();
    res.json(s);
});


router.get('/c/serialize', function (req, res) {

});

router.get('/c/serialize-file', function (req, res) {

});

router.post('/c/import', function (req, res) {

});


//------------------ nodes ------------------------


/**
 * create node
 */
router.post('/c/:cid/n/', function (req, res) {
    let cont = req.params.cid;

    let node = Nodes.createNode(req.body.type);
    if (!node) {
        Utils.debugErr("Cant create node. Check node type.", "Socket");
        res.status(404).send("Cant create node. Check node type.");
        return;
    }
    node.pos = req.body.position;
    engine.add(node);

    //let n =node.serialize();
    let n = {
        id: node.id,
        type: node.type,
        pos: node.pos
    };

    server.socket.io.emit('node-create', JSON.stringify(n));

    Utils.debug("New node created: " + node.type);
    res.send("New node created: " + node.type);
});

router.post('/nodes/clone/:id', function (req, res) {

});


/**
 * delete node
 */
router.delete('/c/:cid/n/:nid', function (req, res) {
    let cont = req.params.cid;
    let id = req.params.nid;

    let node = engine.getNodeById(id);
    if (!node) {
        Utils.debugErr("Cant delete node. Node id does not exist.", "Socket");
        res.status(404).send("Cant delete node. Node id does not exist.");
        return;
    }
    //let node = engine._nodes.find(n => n.id === id);

    engine.remove(node);

    var data = JSON.stringify({id: node.id, container: engine.container_id});
    server.socket.io.emit('node-delete', data);

    Utils.debug("Node deleted: " + node.type);
    res.send("Node deleted: " + node.type);
});


/**
 * node update position
 */
router.put('/nodes', function (req, res) {
    let newNode = JSON.parse(req.body.node);
    // console.log(newNode);
    let node = engine._nodes.find(n => n.id === newNode.id);
    node.pos = newNode.pos;

    server.socket.io.emit('node-update-position', {id: node.id, pos: node.pos});
    res.send("ok");
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