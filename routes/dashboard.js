/**
 * Created by Derwish on 01.07.2016.
 */

var express = require('express');
var router = express.Router();
//var config = require('./../config');


router.get('/', function (req, res, next) {
	res.render('dashboard');
});

module.exports = router;