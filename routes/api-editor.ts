/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
let router = express.Router();

import {engine} from "../public/nodes/nodes-engine"
import server from "../modules/web-server/server"
import {Nodes, Link} from "../public/nodes/nodes";
import Utils from "../public/nodes/utils";

let MODULE_NAME = "Socket";

//------------------ info ------------------------

router.get('/info', function (req, res) {

});
//------------------ containers ------------------------

/**
 * Get container
 */
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
 * Create node
 */
router.post('/c/:cid/n/', function (req, res) {
    let cont = req.params.cid;

    let node = Nodes.createNode(req.body.type);
    if (!node) {
        Utils.debugErr("Cant create node. Check node type.", MODULE_NAME);
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


/**
 * Delete node
 */
router.delete('/c/:cid/n/:id', function (req, res) {
    let cont = req.params.cid;
    let id = req.params.id;

    let node = engine.getNodeById(id);
    if (!node) {
        Utils.debugErr("Cant delete node. Node id does not exist.", MODULE_NAME);
        res.status(404).send("Cant delete node. Node id does not exist.");
        return;
    }
    //let node = engine._nodes.find(n => n.id === id);

    engine.remove(node);

    let data = JSON.stringify({id: node.id, container: engine.container_id});
    server.socket.io.emit('node-delete', data);

    Utils.debug("Node deleted: " + node.type);
    res.send("Node deleted: " + node.type);
});


/**
 * Delete nodes
 */
router.delete('/c/:cid/n/', function (req, res) {
    let cont = req.params.cid;
    let ids = req.body;

    for (let id of ids) {
        let node = engine.getNodeById(id);

        if (!node) {
            Utils.debugErr("Cant delete node. Node id does not exist.", MODULE_NAME);
            res.status(404).send("Cant delete node. Node id does not exist.");
            return;
        }
        //let node = engine._nodes.find(n => n.id === id);

        engine.remove(node);
    }

    let data = JSON.stringify(ids);
    server.socket.io.emit('nodes-delete', data);

    Utils.debug("Nodes deleted: " + JSON.stringify(ids), MODULE_NAME);
    res.send("Nodes deleted: " + JSON.stringify(ids));
});


/**
 * Update node position
 */
router.put('/c/:cid/n/:id/position', function (req, res) {
    let node = engine.getNodeById(req.params.id);
    node.pos = req.body.position;

    server.socket.io.emit('node-update-position', {id: node.id, pos: node.pos});
    res.send("Node position updated");
});

/**
 * Update node size
 */
router.put('/c/:cid/n/:id/size', function (req, res) {
    let node = engine.getNodeById(req.params.id);
    node.size = req.body.size;

    server.socket.io.emit('node-update-size', {id: node.id, size: node.size});
    res.send("Node size updated");
});


router.post('/nodes/clone/:id', function (req, res) {

});


router.post('/nodes/settings/:id', function (req, res) {

});


router.delete('/nodes/all', function (req, res) {

});

router.get('/nodes/description', function (req, res) {

});

//------------------ links ------------------------

/**
 * create link
 */
router.post('/c/:cid/l/', function (req, res) {
    let cont = req.params.cid;
    let link: Link = req.body;

    let node1=engine.getNodeById(link.origin_id);
    let node2=engine.getNodeById(link.target_id);

    // let input = node2.getInputInfo(0);
    //prevent connection of different types
    // if (input && !input.link && input.type == this.connecting_output.type) { //toLowerCase missing

    //if user drag to node instead of slot
    if(link.target_slot==-1){
        //todo find free input
        let input = node2.getInputInfo(0);
        if (input == null) {
            //no inputs
            Utils.debugErr("Cant create link. No free inputs.", MODULE_NAME);
            res.status(404).send("Cant create link. No free inputs.");
            return;
        }
        link.target_slot=0;
    }

    node1.connect(link.origin_slot, node2, link.target_slot);

    server.socket.io.emit('link-create', req.body);

    Utils.debug("Link created");
    res.send("Link created");
});


/**
 * delete link
 */
router.delete('/c/:cid/l/:id', function (req, res) {
    let cont = req.params.cid;
    let id = req.params.id;

    let link = engine.links[id];

    let node = engine.getNodeById(link.origin_id);
    let targetNode = engine.getNodeById(link.target_id);
    if (!node) {
        Utils.debugErr("Cant delete link. Origin node id does not exist.", MODULE_NAME);
        res.status(404).send("Cant delete link. Origin node id does not exist.");
        return;
    }
    if (!targetNode) {
        Utils.debugErr("Cant delete link. Target node id does not exist.", MODULE_NAME);
        res.status(404).send("Cant delete link. Target node id does not exist.");
        return;
    }

    node.disconnectOutput(link.origin_slot, targetNode);
    targetNode.disconnectInput(link.target_slot);


    let data = JSON.stringify({id: link.id, container: engine.container_id});
    server.socket.io.emit('link-delete', data);

    Utils.debug("Link deleted");
    res.send("Link deleted" );
});


//------------------ receiver ------------------------


router.post('/receiver/value', function (req, res) {

});


module.exports = router;