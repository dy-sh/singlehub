/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
let router = express.Router();

import {Container} from "../public/nodes/container"
import {Nodes} from "../public/nodes/nodes";
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

        let room = "d" + container.id;
        if (activeNodesIds.length > 0)
            app.server.socket.io.sockets.in(room).emit('nodes-active', {ids: activeNodesIds});

    }
}


/**
 * Get container
 */
router.get('/c/:id', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't get nodes. Container id [${req.params.cid}] not found.`);

    let nodes = container.getNodesByCategory("ui");

    if (!nodes)
        return res.json();

    let s_nodes = [];
    for (let n of nodes) {
        s_nodes.push(n.serialize())
    }

    res.json(s_nodes);
});