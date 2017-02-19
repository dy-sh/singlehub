require('source-map-support').install();
import Utils from "./public/nodes/utils";
/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

Utils.debug("-------- MyNodes ----------");

import * as path from 'path';
(<any>global).__rootdirname = path.resolve(__dirname);

import {server} from './modules/web-server/server';

Utils.debug("Server started at port " + server.server.address().port, "SERVER")

// import 'modules/debug/configure'
// import {App} from '/modules/web-server/server'
// import 'modules/mysensors/gateway'
// import 'modules/web-server/server'
//
// //mysensors gateway
// // if (config.gateway.mysensors.serial.enable) {
// // 	mys_gateway.connectToSerialPort(config.gateway.mysensors.serial.port, config.gateway.mysensors.serial.baudRate);
// // }
//
//
import {rootContainer, Container} from './public/nodes/container'
// let rootContainer=require('./public/nodes/rootContainer');
rootContainer.socket = server.socket.io;
require('./public/nodes/nodes');
require('./public/nodes/nodes/main');
require('./public/nodes/nodes/debug');
require('./public/nodes/nodes/math');
// require('./modules/test').test();


import {db} from "./modules/database/index";

db.loadDatabase(function (err) {
    if (err) {
        Utils.debugErr(err.message, "DATABASE");
        return
    }

    Utils.debug("Database loaded", "DATABASE");

    //add rootContainer if not exist
    db.getContainer(0, function (err, cont) {
        if (!cont) {
            Utils.debug("Create root container", "DATABASE");
            db.addContainer(rootContainer);
        }
    });

    //import containers

    //add containers
    db.getContainers(function (err, containers) {
        if (!containers)
            return;

        for (let c of containers) {
            if (c.id == 0) {
                rootContainer.configure(c);
            }
            else {
                //add container
            }
        }

        Utils.debug("Loaded "+containers.length+" containers", "DATABASE");

        //add nodes
        db.getNodes(function (err, nodes) {
            if (!nodes)
                return;

            for (let n of nodes) {
                let cont = Container.containers[n.cid];
                cont.add_serialized_node(n);
            }

            Utils.debug("Loaded "+nodes.length+" nodes", "DATABASE");
        });
    });


});

