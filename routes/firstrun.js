var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.render('firstRun/index');
});

router.get('/Database', function (req, res, next) {
	res.render('FirstRun/database');
});

module.exports = router;
