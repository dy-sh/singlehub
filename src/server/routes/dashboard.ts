/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
import { Container } from "../../nodes/container";
let router = express.Router();
//var config = require('./../config');


router.get('/', function (req, res, next) {
    res.render('dashboard/index', { container_id: 0 });
});


router.get('/c/:cid', function (req, res, next) {
    // if (req.params.cid == 0)
    //     res.redirect("/dashboard/");
    // else
    res.render('dashboard/index', { container_id: req.params.cid });
});


//node direct page get
router.get('/c/:cid/n/:id*', function (req, res) {
    let cont = Container.containers[req.params.cid];
    if (!cont) return res.status(404).send(`Can't send request to node. Container id [${req.params.cid}] not found.`);

    let node = cont.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] not found.`);

    if (node['onDashboardGetRequest'])
        node['onDashboardGetRequest'](req, res);
    else
        return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] does not accept requests.`);
});

//node direct page post
router.post('/c/:cid/n/:id*', function (req, res) {
    let cont = Container.containers[req.params.cid];
    if (!cont) return res.status(404).send(`Can't send request to node. Container id [${req.params.cid}] not found.`);

    let node = cont.getNodeById(req.params.id);
    if (!node) return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] not found.`);

    if (node['onDashboardPostRequest'])
        node['onDashboardPostRequest'](req, res);
    else
        return res.status(404).send(`Can't send request to node. Node id [${req.params.cid}/${req.params.id}] does not accept requests.`);
});

module.exports = router;