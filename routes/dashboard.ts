/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
let router = express.Router();
//var config = require('./../config');


router.get('/', function (req, res, next) {
	// res.redirect("/editor")
	res.render('dashboard/index');
});

module.exports = router;