var express = require('express');
var router = express.Router();
var config = require('./../config');
var fs = require('fs');

// first run wizard

router.get('/FirstRun', function (req, res, next) {
	res.render('FirstRun/index');
});


//---------- Database


router.get('/FirstRun/Database', function (req, res, next) {
	res.render('FirstRun/Database/index');
});

router.get('/FirstRun/Database/External', function (req, res, next) {
	res.render('FirstRun/Database/external');
});

router.post('/FirstRun/Database/External', function (req, res, next) {
	//todo mongo db connection
	res.render('FirstRun/Database/notEmpty');
});

router.get('/FirstRun/Database/Delete', function (req, res, next) {
	//todo drop database
	res.redirect("/FirstRun/Gateway")
});

router.get('/FirstRun/Database/Use', function (req, res, next) {
	config.dataBase.enable = true;
	config.dataBase.useInternalDb = false;
	res.redirect("/FirstRun/Gateway")
});


router.get('/FirstRun/Database/Builtin', function (req, res, next) {
	//todo internal db connection
	config.dataBase.enable = true;
	config.dataBase.useInternalDb = true;
	saveConfig();
	res.redirect("/FirstRun/Gateway")
});

router.get('/FirstRun/Database/None', function (req, res, next) {
	config.dataBase.enable = false;
	saveConfig();
	res.redirect("/FirstRun/Gateway")
});


//---------- Gateway


router.get('/FirstRun/Gateway', function (req, res, next) {
	res.render('FirstRun/Gateway/index');
});

router.get('/FirstRun/Gateway/Ethernet', function (req, res, next) {
	res.render('FirstRun/Gateway/ethernet', {
		address: config.gateway.mysensors.ethernet.address,
		port: config.gateway.mysensors.ethernet.port
	});
});

router.post('/FirstRun/Gateway/Ethernet', function (req, res, next) {
	//todo connect to ethernet gateway
	config.gateway.mysensors.serial.enable = false;
	config.gateway.mysensors.ethernet.enable = true;
	config.gateway.mysensors.ethernet.address = req.body.address;
	config.gateway.mysensors.ethernet.port = req.body.port;
	saveConfig();
	res.redirect("/FirstRun/User")
});


router.get('/FirstRun/Gateway/Serial', function (req, res, next) {
	//todo get serial ports list
	res.render('FirstRun/Gateway/serial', {
		ports: ["COM1", "COM3"],
		baudRate: config.gateway.mysensors.serial.baudRate,
		currentPort: config.gateway.mysensors.serial.port
	});
});


router.post('/FirstRun/Gateway/Serial', function (req, res, next) {
	//todo connect to serial gateway
	console.log(req.body);
	config.gateway.mysensors.ethernet.enable = false;
	config.gateway.mysensors.serial.enable = true;
	config.gateway.mysensors.serial.baudRate = req.body.baudRate;
	config.gateway.mysensors.serial.port = req.body.port;
	saveConfig();
	res.redirect("/FirstRun/User")
});


//---------- User


router.get('/FirstRun/User', function (req, res, next) {
	if (config.dataBase.enable)
		res.render('FirstRun/User/index', {canSkip: false});
	else
		res.render('FirstRun/User/noDatabase');
});

router.post('/FirstRun/User', function (req, res, next) {
	//todo save user profile to db
	res.redirect("/FirstRun/Complete")
});


router.get('/FirstRun/Complete', function (req, res, next) {
	config.firstRun = false;
	saveConfig();
	res.redirect("/Dashboard")
});


//redirect all routes if first run
router.use('/', function (req, res, next) {
	if (config.firstRun == true)
		res.redirect('/FirstRun/');
	else
		next();
});


module.exports = router;


function saveConfig() {
	fs.writeFile('./config.json', JSON.stringify(config, null, '\t'), function (err) {
		if (err) {
			console.log('Error saving config.json.');
			console.log(err.message);
			return;
		}
		console.log('Configuration saved to config.json.')
	});
}