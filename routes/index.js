/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.redirect('/NodeEditor/');
	//res.render('index', { title: 'Express' });
});



module.exports = router;
