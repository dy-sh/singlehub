var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.render('firstRun/index', {title: 'First Run'});
});

router.get('/Database', function (req, res, next) {
	res.render('firstRun/database', {title: 'First Run'});
});

module.exports = router;
