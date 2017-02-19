require('source-map-support').install();
import Utils from "./public/nodes/utils";
/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

console.log("-------- MyNodes ----------")

import * as path from 'path';
(<any>global).__rootdirname = path.resolve(__dirname);

import {server} from './modules/web-server/server';

Utils.debug("Server started at port " + server.server.address().port,"SERVER")

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
import {rootContainer} from './public/nodes/container'
// let rootContainer=require('./public/nodes/rootContainer');
rootContainer.socket=server.socket.io;
require('./public/nodes/nodes');
require('./public/nodes/nodes/main');
require('./public/nodes/nodes/debug');
require('./public/nodes/nodes/math');
require('./modules/test').test();

//import nodes form db
import {db} from "./modules/database/index";
db.importNodes();