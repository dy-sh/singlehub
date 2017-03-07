/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
let router = express.Router();

import {Container} from "../public/nodes/container"
import {Link, LinkInfo} from "../public/nodes/node";
import {app} from "../app";


setInterval(updateActiveNodes, 300);

function updateActiveNodes() {
    if (!app.rootContainer)
        return;


    for (let c in Container.containers) {
        let container = Container.containers[c];

        let activeNodesIds = [];

        for (let id in container._nodes) {
            let node = container._nodes[id];
            if (node.isRecentlyActive) {
                node.isRecentlyActive = false;
                activeNodesIds.push(node.id);
            }
        }

        if (activeNodesIds.length > 0)
            app.server.editorSocket.io.in("" + container.id).emit('nodes-active', {
                ids: activeNodesIds,
                cid: container.id
            });

    }
}

//------------------ info ------------------------

router.get('/info', function (req, res) {

});
//------------------ containers ------------------------

/**
 * Get container
 */
router.get('/c/:cid', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't get container. Container id [${req.params.cid}] not found.`);

    let s = container.serialize();
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
    if (!container) return res.status(404).send(`Can't create node. Container id [${req.params.cid}] not found.`);

    let node = container.createNode(req.body.type, {pos: req.body.position});

    if (!node) return res.status(404).send(`Can't create node. Node type [${req.body.type}] not found.`);


    app.server.editorSocket.io.emit('node-create', {
        id: node.id,
        cid: req.params.cid,
        type: node.type,
        pos: node.pos
    });

    if (node.isDashboardNode)
        app.server.dashboardSocket.io.in(req.params.cid).emit('node-create', {
            id: node.id,
            cid: req.params.cid,
            type: node.type,
            pos: node.pos
        });

    res.send(`New node created: type [${node.type}] id [${node.container.id}/${node.id}]`);
});


/**
 * Delete nodes
 */
router.delete('/c/:cid/n/', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't delete node. Container id [${req.params.cid}] not found.`);

    let dashboardNodes = [];
    for (let id of req.body) {
        let node = container.getNodeById(id);
        if (!node) return res.status(404).send(`Can't delete node. Node id [${req.params.cid}/${req.params.id}] not found.`);

        if (node.isDashboardNode)
            dashboardNodes.push(id);

        container.remove(node);
    }

    app.server.editorSocket.io.emit('nodes-delete', {
        nodes: req.body,
        cid: req.params.cid
    });

    if (dashboardNodes.length > 0) {
        app.server.dashboardSocket.io.in(req.params.cid).emit('nodes-delete', {
            nodes: dashboardNodes,
            cid: req.params.cid,
        });
    }

    res.send(`Nodes deleted: ids ${req.params.cid}/${JSON.stringify(req.body.ids)}`);
});


/**
 * Update node position
 */
router.put('/c/:cid/n/:id/position', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't update node position. Container id [${req.params.cid}] not found.`);

    let node = container.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't update node position. Node id [${req.params.cid}/${req.params.id}] not found.`);

    node.pos = req.body.position;

    if (app.db)
        app.db.updateNode(node.id, node.container.id, {$set: {pos: node.pos}});

    app.server.editorSocket.io.emit('node-update-position', {
        id: req.params.id,
        cid: req.params.cid,
        pos: node.pos
    });
    res.send(`Node position updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
});

/**
 * Update node size
 */
router.put('/c/:cid/n/:id/size', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't update node size. Container id [${req.params.cid}] not found.`);

    let node = container.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't update node size. Node id [${req.params.cid}/${req.params.id}] not found.`);

    node.size = req.body.size;

    if (app.db)
        app.db.updateNode(node.id, node.container.id, {$set: {size: node.size}});

    app.server.editorSocket.io.emit('node-update-size', {
        id: req.params.id,
        cid: req.params.cid,
        size: node.size
    });
    res.send(`Node size updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
});


/**
 * Move nodes to new container
 */
router.put('/c/:cid/n/move/', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't move nodes. Container id [${req.params.cid}] not found.`);

    for (let id of req.body.ids) {
        let node = container.getNodeById(id);
        if (!node) return res.status(404).send(`Can't move nodes. Node id [${req.params.cid}/${req.params.id}] not found.`);
    }

    container.mooveNodesToNewContainer(req.body.ids, req.body.pos);

    app.server.editorSocket.io.emit('nodes-move-to-new-container', {
        ids: req.body.ids,
        pos: req.body.pos,
        cid: req.params.cid
    });

    res.send(`Nodes moved: ids ${req.params.cid}/${JSON.stringify(req.body.ids)}`);
});


router.post('/nodes/clone/:id', function (req, res) {

});


router.put('/c/:cid/n/:id/settings', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't update node size. Container id [${req.params.cid}] not found.`);

    let node = container.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't update node size. Node id [${req.params.cid}/${req.params.id}] not found.`);

    for (let s of req.body) {
        node.settings[s.key].value = s.value;
    }

    if (node['onSettingsChanged'])
        node['onSettingsChanged']();

    if (app.db)
        app.db.updateNode(node.id, node.container.id, {$set: {settings: node.settings}});

    app.server.editorSocket.io.emit('node-settings', {
        id: req.params.id,
        cid: req.params.cid,
        settings: node.settings
    });

    if (node.isDashboardNode)
        app.server.dashboardSocket.io.in(req.params.cid).emit('node-settings', {
            id: req.params.id,
            cid: req.params.cid,
            settings: node.settings
        });

    res.send(`Node settings updated: type [${node.type}] id [${node.container.id}/${node.id}]`);
});


router.delete('/nodes/all', function (req, res) {

});

router.get('/nodes/description', function (req, res) {

});

//------------------ links ------------------------

/**
 * Create link
 */
router.post('/c/:cid/l', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't create link. Container id [${req.params.cid}] not found.`);

    let link: LinkInfo = req.body;

    let node = container.getNodeById(link.origin_id);
    let targetNode = container.getNodeById(link.target_id);
    if (!node) return res.status(404).send(`Can't create link. Node id [${req.params.cid}/${link.origin_id}] not found.`);
    if (!targetNode) return res.status(404).send(`Can't create link. Node id [${req.params.cid}/${link.target_id}] not found.`);

    //if user drag to node instead of slot
    if (link.target_slot == -1) {
        //todo find free input
        let input = targetNode.getInputInfo(0);
        if (!input) return res.status(404).send(`Can't create link. Node id [${req.params.cid}/${link.target_id}] has no free inputs.`);
        link.target_slot = 0;
    }

    node.connect(link.origin_slot, targetNode.id, link.target_slot);

    app.server.editorSocket.io.emit('link-create', {
        cid: req.params.cid,
        link: link
    });


    res.send(`Link created: from [${node.container.id}/${node.id}] to [${targetNode.container.id}/${targetNode.id}]`);
});


/**
 * Delete link
 */
router.delete('/c/:cid/l', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't create link. Container id [${req.params.cid}] not found.`);

    let link: LinkInfo = req.body;

    let node = container.getNodeById(link.origin_id);
    let targetNode = container.getNodeById(link.target_id);
    if (!node) return res.status(404).send(`Can't create link. Node id [${req.params.cid}/${link.origin_id}] not found.`);
    if (!targetNode) return res.status(404).send(`Can't create link. Node id [${req.params.cid}/${link.target_id}] not found.`);


    // node.disconnectOutput(link.origin_slot, targetNode);
    targetNode.disconnectInput(link.target_slot);

    app.server.editorSocket.io.emit('link-delete', {
        cid: req.params.cid,
        link: link
    });

    res.send(`Link deleted: from [${node.container.id}/${node.id}] to [${targetNode.container.id}/${targetNode.id}]`);
});


//------------------ Container ------------------------


/**
 * Run step container
 */
router.get('/state', function (req, res) {
    let state = {
        isRunning: app.rootContainer.isRunning
    };
    res.json(state);
});

/**
 * Run container
 */
router.post('/run', function (req, res) {
    app.rootContainer.run();
    app.server.editorSocket.io.emit('container-run');
    res.send(`Run container`);
});


/**
 * Stop container
 */
router.post('/stop', function (req, res) {
    app.rootContainer.stop();
    app.server.editorSocket.io.emit('container-stop');
    res.send(`Stop container`);
});


/**
 * Run step container
 */
router.post('/step', function (req, res) {
    app.rootContainer.runStep();
    app.server.editorSocket.io.emit('container-run-step');
    res.send(`Run step container`);
});


//------------------ nodes internal requests ------------------------


router.get('/c/:cid/n/:id*', function (req, res) {
    let cont = Container.containers[req.params.cid];
    if (!cont) return res.status(404).send(`Can't send request to node. Container id [${req.params.cid}] not found.`);

    let node = cont.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] not found.`);

    if (node['onEditorApiGetRequest'])
        node['onEditorApiGetRequest'](req, res);
    else
        return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] does not accept requests.`);
});

router.post('/c/:cid/n/:id*', function (req, res) {
    let cont = Container.containers[req.params.cid];
    if (!cont) return res.status(404).send(`Can't send request to node. Container id [${req.params.cid}] not found.`);

    let node = cont.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] not found.`);

    if (node['onEditorApiPostRequest'])
        node['onEditorApiPostRequest'](req, res);
    else
        return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] does not accept requests.`);
});

module.exports = router;