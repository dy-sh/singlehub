/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import * as express from 'express';
import * as fs from 'fs';
import { app } from "../app";


let router = express.Router();
let config = require('../../config.json');

const log = require('logplease').create('app', { color: 2 });

// first run wizard



// prevent access if already configured (for security)

router.use('/first-run', function (req, res, next) {
    if (config.firstRun == false)
        res.redirect('/dashboard/');
    else
        next();
});

// ------- index -----


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
    res.render('first-run/database/not-empty');
});

router.get('/first-run/database/delete', function (req, res, next) {
    //drop built-in database
    if (config.dataBase.useInternalDb) {
        app.db.dropUsers(function (err) {
            if (err) {
                res.json(err);
                return;
            }

            app.db.dropNodes(function (err) {
                if (err) {
                    res.json(err);
                    return;
                }

                app.db.dropApp(function (err) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.redirect("/first-run/user");
                });
            });
        });
    }
    else {
        res.redirect("/first-run/user");
    }
});

router.get('/first-run/database/use', function (req, res, next) {
    res.redirect("/first-run/hardware")
});


router.get('/first-run/database/builtin', function (req, res, next) {

    config.dataBase.enable = true;
    config.dataBase.useInternalDb = true;
    saveConfig();

    app.connectDatabase();
    app.loadDatabase(false, function (err) {
        if (err) {
            res.send("Failed to load database");
            return;
        }

        //check db is not empty
        app.db.getUsersCount(function (err, count) {
            if (err) {
                res.json(err);
                return;
            }

            if (count == 0)
                res.redirect("/first-run/user");
            else
                res.render("first-run/database/not-empty");
        });
    });


});

router.get('/first-run/database/none', function (req, res, next) {
    config.dataBase.enable = false;
    saveConfig();
    res.redirect("/first-run/user")
});


//---------- User


router.get('/first-run/user', function (req, res, next) {
    let user = {
        name: "",
        email: ""
    };

    if (config.dataBase.enable)
        res.render('first-run/user/index', { canSkip: false, user: user });
    else
        res.render('first-run/user/no-database');
});

router.post('/first-run/user', function (req, res, next) {
    let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    req.assert('name', 'Login is required').notEmpty();
    req.assert('password', 'Password is required').notEmpty();
    // req.assert('email', 'A valid email is required').isEmail();
    req.assert('c_password', 'Passwords must match').equals(req.body.password);
    let errors = req.validationErrors();


    if (!errors) {
        //save user profile to db
        app.db.getUser(user.name, function (err, doc) {
            if (err) {
                res.render('first-run/user/index', {
                    canSkip: false,
                    user: user,
                    errors: [{ param: "name", msg: err, value: "" }]
                });
                return;
            }

            if (doc) {
                res.render('first-run/user/index', {
                    canSkip: false,
                    user: user,
                    errors: [{ param: "name", msg: "User already exist", value: "" }]
                });
                return;
            }

            app.db.addUser(user, function (err) {
                if (err) {
                    res.render('first-run/user/index', {
                        canSkip: false,
                        user: user,
                        errors: [{ param: "name", msg: err, value: "" }]
                    });
                }
                res.redirect("/first-run/hardware");
            });
        });


    } else {
        res.render('first-run/user/index', {
            canSkip: false,
            user: user,
            errors: errors
        });
    }


});


//---------- Hardware

router.get('/first-run/hardware', function (req, res, next) {
    res.render('first-run/hardware/index');
});

router.get('/first-run/hardware/none', function (req, res, next) {
    // config.gateway.mysensors.serial.enable = false;
    // config.gateway.mysensors.ethernet.enable = false;
    // saveConfig();
    res.redirect("/first-run/complete")
});

router.get('/first-run/hardware/ethernet', function (req, res, next) {
    res.render('first-run/hardware/ethernet', {
        address: config.gateway.mysensors.ethernet.address,
        port: config.gateway.mysensors.ethernet.port
    });
});

router.post('/first-run/hardware/ethernet', function (req, res, next) {
    //todo connect to ethernet gateway
    config.gateway.mysensors.serial.enable = false;
    config.gateway.mysensors.ethernet.enable = true;
    config.gateway.mysensors.ethernet.address = req.body.address;
    config.gateway.mysensors.ethernet.port = req.body.port;
    saveConfig();
    res.redirect("/first-run/complete")
});


router.get('/first-run/hardware/serial', function (req, res, next) {
    //todo get serial ports list
    res.render('first-run/hardware/serial', {
        ports: ["COM1", "COM3"],
        baudRate: config.gateway.mysensors.serial.baudRate,
        currentPort: config.gateway.mysensors.serial.port
    });
});


router.post('/first-run/hardware/serial', function (req, res, next) {
    //todo connect to serial gateway
    config.gateway.mysensors.ethernet.enable = false;
    config.gateway.mysensors.serial.enable = true;
    config.gateway.mysensors.serial.baudRate = req.body.baudRate;
    config.gateway.mysensors.serial.port = req.body.port;
    saveConfig();
    res.redirect("/first-run/complete")
});


// ------------ complete ----------

router.get('/first-run/complete', function (req, res, next) {
    config.firstRun = false;
    saveConfig();
    app.start();
    res.redirect("/dashboard")
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
    fs.writeFile(__dirname + ' /../../config.json', JSON.stringify(config, null, '\t'), function (err) {
        if (err) {
            log.error('Error saving config.json.');
            log.error(err.message);
            return;
        }
        log.debug('Configuration saved to config.json.')
    });
}