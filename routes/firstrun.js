var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.render('FirstRun/index');
});

router.get('/Database', function (req, res, next) {
	res.render('FirstRun/Database/index');
});

router.get('/Database/External', function (req, res, next) {
	res.render('FirstRun/Database/external');
});


module.exports = router;
