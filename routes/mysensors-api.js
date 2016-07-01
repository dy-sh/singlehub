/**
 * Created by Serwish on 01.07.2016.
 */

var express = require('express');
var router = express.Router();
//var config = require('./../config');
var gateway = require('../modules/mysensors/gateway');

router.get('/IsConnected', function (req, res) {
	res.json(gateway.isConnected === true);
});

module.exports = router;