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


router.get('/Gateway', function (req, res, next) {
	res.render('FirstRun/Gateway/index');
});

router.get('/Gateway/Ethernet', function (req, res, next) {
	res.render('FirstRun/Gateway/ethernet');
});

router.get('/Gateway/Serial', function (req, res, next) {
	res.render('FirstRun/Gateway/serial');
});

router.get('/User', function (req, res, next) {
	res.render('FirstRun/User/index');
});

router.get('/User/NoDatabase', function (req, res, next) {
	res.render('FirstRun/User/noDatabase');
});

module.exports = router;
