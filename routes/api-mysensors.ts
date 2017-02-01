/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
var router = express.Router();
var gateway = require('../modules/mysensors/gateway');
//var config = require('./../config');

router.get('/IsConnected', function (req, res) {
	res.json(gateway.isConnected === true);
});

router.get('/GetAllNodes', function (req, res) {
	res.json(gateway.nodes);
});

module.exports = router;