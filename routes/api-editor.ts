/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
let router = express.Router();

import {rootContainer, Container} from "../public/nodes/container"
import {server} from "../modules/web-server/server"
import {Nodes} from "../public/nodes/nodes";
import {Link} from "../public/nodes/node";
import Utils from "../public/nodes/utils";

let MODULE_NAME = "SOCKET";


setInterval(updateActiveNodes, 100);

function updateActiveNodes() {
    let activeNodesIds = [];
    for (let node of rootContainer._nodes) {
        if (node.isActive) {
            node.isActive = false;
            activeNodesIds.push(node.id);
        }
    }

    server.socket.io.emit('nodes-active', {ids: activeNodesIds, cid: rootContainer.id});
}

//------------------ info ------------------------

router.get('/info', function (req, res) {

});
//------------------ containers ------------------------

/**
 * Get container
 */
router.get('/c/:id', function (req, res) {
    let s = rootContainer.serialize();
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
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant create node. Container id [${req.params.cid}] not found.`);

    let node = Nodes.createNode(req.body.type);
    if (!node) return res.status(404).send(`${MODULE_NAME}: Cant create node. Node type [${req.body.type}] not found.`);

    node.pos = req.body.position;
    container.add(node);

    server.socket.io.emit('node-create', {
        id: node.id,
        cid: req.params.cid,
        type: node.type,
        pos: node.pos
    });

    res.send(`${MODULE_NAME}: New node created: type [${node.type}] id [${node.container.id}/${node.id}]`);
});


/**
 * Delete node
 */
router.delete('/c/:cid/n/:id', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant delete node. Container id [${req.params.cid}] not found.`);

    let node = container.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`${MODULE_NAME}: Cant delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);

    container.remove(node);

    server.socket.io.emit('node-delete', {
        id: req.params.id,
        cid: req.params.cid,
    });

    res.send(`${MODULE_NAME}: Node deleted: type [${node.type}] id [${node.container.id}/${node.id}]`);
});


/**
 * Delete nodes
 */
router.delete('/c/:cid/n/', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant delete node. Container id [${req.params.cid}] not found.`);

    for (let id of req.body) {
        let node = rootContainer.getNodeById(id);
        if (!node) return res.status(404).send(`${MODULE_NAME}: Cant delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);
        rootContainer.remove(node);
    }

    server.socket.io.emit('nodes-delete', {
        nodes: req.body,
        cid: req.params.cid
    });

    res.send(`${MODULE_NAME}: Nodes deleted: ids ${req.params.cid}/${JSON.stringify(req.body.ids)}`);
});


/**
 * Update node position
 */
router.put('/c/:cid/n/:id/position', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant update node position. Container id [${req.params.cid}] not found.`);

    let node = container.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`${MODULE_NAME}: Cant update node position. Node id [${req.params.cid}/${req.params.id}] not found.`);

    node.pos = req.body.position;

    server.socket.io.emit('node-update-position', {
        id: req.params.id,
        cid: req.params.cid,
        pos: node.pos
    });
    res.send(`${MODULE_NAME}: Node position updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
});

/**
 * Update node size
 */
router.put('/c/:cid/n/:id/size', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant update node size. Container id [${req.params.cid}] not found.`);

    let node = container.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`${MODULE_NAME}: Cant update node size. Node id [${req.params.cid}/${req.params.id}] not found.`);

    node.size = req.body.size;

    server.socket.io.emit('node-update-size', {
        id: req.params.id,
        cid: req.params.cid,
        size: node.size
    });
    res.send(`${MODULE_NAME}: Node size updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
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
 * Create link
 */
router.post('/c/:cid/l/', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant create link. Container id [${req.params.cid}] not found.`);

    let link: Link = req.body;

    let node = container.getNodeById(link.origin_id);
    let targetNode = container.getNodeById(link.target_id);
    if (!node) return res.status(404).send(`${MODULE_NAME}: Cant create link. Node id [${req.params.cid}/${link.origin_id}] not found.`);
    if (!targetNode) return res.status(404).send(`${MODULE_NAME}: Cant create link. Node id [${req.params.cid}/${link.target_id}] not found.`);

    // let input = targetNode.getInputInfo(0);
    //prevent connection of different types
    // if (input && !input.link && input.type == this.connecting_output.type) { //toLowerCase missing

    //if user drag to node instead of slot
    if (link.target_slot == -1) {
        //todo find free input
        let input = targetNode.getInputInfo(0);
        if (!input) return res.status(404).send(`${MODULE_NAME}: Cant create link. Node id [${req.params.cid}/${link.target_id}] has no free inputs.`);
        link.target_slot = 0;
    }

    // node.disconnectOutput(link.origin_slot, targetNode);
    // targetNode.disconnectInput(link.target_slot);

    node.connect(link.origin_slot, targetNode, link.target_slot);

    server.socket.io.emit('link-create', {
        cid: req.params.cid,
        link: req.body
    });

    res.send(`${MODULE_NAME}: Link created: from [${node.container.id}/${node.id}] to [${targetNode.container.id}/${targetNode.id}]`);
});


/**
 * Delete link
 */
router.delete('/c/:cid/l/:id', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`${MODULE_NAME}: Cant create link. Container id [${req.params.cid}] not found.`);

    let link = container.links[req.params.id];

    let node = container.getNodeById(link.origin_id);
    let targetNode = container.getNodeById(link.target_id);
    if (!node) return res.status(404).send(`${MODULE_NAME}: Cant create link. Node id [${req.params.cid}/${link.origin_id}] not found.`);
    if (!targetNode) return res.status(404).send(`${MODULE_NAME}: Cant create link. Node id [${req.params.cid}/${link.target_id}] not found.`);


    // node.disconnectOutput(link.origin_slot, targetNode);
    targetNode.disconnectInput(link.target_slot);


    server.socket.io.emit('link-delete', {
        cid: req.params.cid,
        id: req.params.id
    });

    res.send(`${MODULE_NAME}: Link deleted: from [${node.container.id}/${node.id}] to [${targetNode.container.id}/${targetNode.id}]`);
});


//------------------ Container ------------------------


/**
 * Run step container
 */
router.get('/state', function (req, res) {
    let state={
        isRunning:rootContainer.isRunning
    };
    res.json(state);
});

/**
 * Run container
 */
router.post('/run', function (req, res) {
    rootContainer.run();
    server.socket.io.emit('container-run');
    res.send(`${MODULE_NAME}: Run container`);
});


/**
 * Stop container
 */
router.post('/stop', function (req, res) {
    rootContainer.stop();
    server.socket.io.emit('container-stop');
    res.send(`${MODULE_NAME}: Stop container`);
});


/**
 * Run step container
 */
router.post('/step', function (req, res) {
    rootContainer.runStep();
    server.socket.io.emit('container-run-step');
    res.send(`${MODULE_NAME}: Run step container`);
});
//------------------ receiver ------------------------


router.post('/receiver/value', function (req, res) {

});


module.exports = router;