/**
 * Created by Serwish on 01.07.2016.
 */

var express = require('express');
var router = express.Router();
//var config = require('./../config');


router.get('/IsConnected', function (req, res) {
	var gateway = require('../modules/mysensors/gateway').gateway;
	res.json(gateway.ready === true);
});

module.exports = router;