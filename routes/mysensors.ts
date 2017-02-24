/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
var router = express.Router();
//var config = require('./../config');


router.get('/', function (req, res, next) {
	res.render('MySensors/index');
});

module.exports = router;