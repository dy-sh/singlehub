/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

import * as express from 'express';
import * as fs from 'fs';
import {db} from "../modules/database"

let router = express.Router();
let config = require('./../config');


// first run wizard

router.get('/first-run', function (req, res, next) {
	res.render('first-run/index');
});


//---------- Database


router.get('/first-run/database', function (req, res, next) {
	res.render('first-run/database/index');
});

router.get('/first-run/database/external', function (req, res, next) {
	res.render('first-run/database/external');
});

router.post('/first-run/database/external', function (req, res, next) {
	//todo mongo db connection
	res.render('first-run/database/notEmpty');
});

router.get('/first-run/database/delete', function (req, res, next) {
	//todo drop database
	res.redirect("/first-run/user")
});

router.get('/first-run/database/use', function (req, res, next) {
	config.dataBase.enable = true;
	config.dataBase.useInternalDb = false;
	res.redirect("/first-run/user")
});


router.get('/first-run/database/builtin', function (req, res, next) {

	//todo internal db connection
	config.dataBase.enable = true;
	config.dataBase.useInternalDb = true;
	saveConfig();
	res.redirect("/first-run/user")
});

router.get('/first-run/database/none', function (req, res, next) {
	config.dataBase.enable = false;
	saveConfig();
	res.redirect("/first-run/user")
});



//---------- User


router.get('/first-run/user', function (req, res, next) {
	if (config.dataBase.enable)
		res.render('first-run/user/index', {canSkip: false});
	else
		res.render('first-run/user/no-database');
});

router.post('/first-run/user', function (req, res, next) {
	//todo save user profile to db
	// console.log()
	// db.users.insert({})
	res.redirect("/first-run/hardware")
});







//---------- Gateway


router.get('/first-run/gateway', function (req, res, next) {
	res.render('first-run/gateway/index');
});

router.get('/first-run/gateway/ethernet', function (req, res, next) {
	res.render('first-run/gateway/ethernet', {
		address: config.gateway.mysensors.ethernet.address,
		port: config.gateway.mysensors.ethernet.port
	});
});

router.post('/first-run/gateway/ethernet', function (req, res, next) {
	//todo connect to ethernet gateway
	config.gateway.mysensors.serial.enable = false;
	config.gateway.mysensors.ethernet.enable = true;
	config.gateway.mysensors.ethernet.address = req.body.address;
	config.gateway.mysensors.ethernet.port = req.body.port;
	saveConfig();
	res.redirect("/first-run/user")
});


router.get('/first-run/gateway/serial', function (req, res, next) {
	//todo get serial ports list
	res.render('first-run/gateway/serial', {
		ports: ["COM1", "COM3"],
		baudRate: config.gateway.mysensors.serial.baudRate,
		currentPort: config.gateway.mysensors.serial.port
	});
});


router.post('/first-run/gateway/serial', function (req, res, next) {
	//todo connect to serial gateway
	console.log(req.body);
	config.gateway.mysensors.ethernet.enable = false;
	config.gateway.mysensors.serial.enable = true;
	config.gateway.mysensors.serial.baudRate = req.body.baudRate;
	config.gateway.mysensors.serial.port = req.body.port;
	saveConfig();
	res.redirect("/first-run/user")
});


// ------------ complete ----------

router.get('/first-run/complete', function (req, res, next) {
	config.firstRun = false;
	saveConfig();
	res.redirect("/Dashboard")
});

// ------------ redirect other ----------

//redirect all routes if first run
router.use('/', function (req, res, next) {
	if (config.firstRun == true)
		res.redirect('/first-run/');
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