/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
let router = express.Router();

import { Container } from "../../nodes/container"
import { Link, LinkInfo } from "../../nodes/node";
import app from "../../app";

//
// setInterval(updateActiveNodes, 1000);
//
// function updateActiveNodes() {
//     if (!app.rootContainer)
//         return;
//
//
//     for (let c in Container.containers) {
//         let container = Container.containers[c];
//
//         let activeNodesIds = [];
//
//         for (let id in container._nodes) {
//             let node = container._nodes[id];
//             if (node.isRecentlyActive) {
//                 node.isRecentlyActive = false;
//                 activeNodesIds.push(node.id);
//             }
//         }
//
//         if (activeNodesIds.length > 0)
//             app.server.dashboardSocket.io.in(""+container.id).emit('nodes-active', {ids: activeNodesIds, cid: container.id});
//
//     }
// }


/**
 * Get container
 */
router.get('/c/:cid', function (req, res) {
    let container = Container.containers[req.params.cid];
    if (!container) return res.status(404).send(`Can't get container. Container id [${req.params.cid}] not found.`);

    let s = container.serialize(true, true);
    res.json(s);
});


module.exports = router;