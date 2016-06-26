var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
	res.render('FirstRun/index');
});


//---------- Database


router.get('/Database', function (req, res, next) {
	res.render('FirstRun/Database/index');
});

router.get('/Database/External', function (req, res, next) {
	res.render('FirstRun/Database/external');
});

router.post('/Database/External', function (req, res, next) {
	//todo mongo db connection
	res.render('FirstRun/Database/notEmpty');
});

router.get('/Database/Delete', function (req, res, next) {
	//todo drop database
	res.redirect("/FirstRun/Gateway")
});

router.get('/Database/Use', function (req, res, next) {
	res.redirect("/FirstRun/Gateway")
});

router.get('/Database/Builtin', function (req, res, next) {
	//todo internal db connection
	res.redirect("/FirstRun/Gateway")
});

router.get('/Database/None', function (req, res, next) {
	//todo disable db
	res.redirect("/FirstRun/Gateway")
});


//---------- Gateway


router.get('/Gateway', function (req, res, next) {
	res.render('FirstRun/Gateway/index');
});

router.get('/Gateway/Ethernet', function (req, res, next) {
	//todo settings from db
	res.render('FirstRun/Gateway/ethernet', {address: "192.168.1.3", port: 5003});
});

router.post('/Gateway/Ethernet', function (req, res, next) {
	//todo connect to ethernet gateway
	//todo save settings to db
	res.redirect("/FirstRun/User")
});

router.get('/Gateway/Serial', function (req, res, next) {
	//todo get serial ports list
	//todo settings from db
	res.render('FirstRun/Gateway/serial', {ports: ["COM1", "COM3"], baudRate: 115200, currentPort: "COM3"});
});


router.post('/Gateway/Serial', function (req, res, next) {
	//todo connect to serial gateway
	//todo save settings to db
	res.redirect("/FirstRun/User")
});


//---------- User


router.get('/User', function (req, res, next) {
	res.render('FirstRun/User/index', {canSkip: false});
	//if (noDb)
	//res.render('FirstRun/User/noDatabase');
});

router.post('/User', function (req, res, next) {
	//todo save user profile to db
	res.redirect("/Dashboard")
});


module.exports = router;

