/**
 * Created by Derwish on 02.07.2016.
 */

var express = require('express');
var router = express.Router();
//var config = require('./../config');


router.get('/', function (req, res, next) {
	res.render('node-editor');
});

module.exports = router;