/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
var router = express.Router();
//var config = require('./../config');


router.get('/', function (req, res, next) {
	res.render('MySensors/index');
});

module.exports = router;