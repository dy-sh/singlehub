/**
 * Created by Serwish on 01.07.2016.
 */

var express = require('express');
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