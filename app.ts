/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */

console.log("-------- MyNodes ----------")

import * as path from 'path';
(<any>global).__rootdirname = path.resolve(__dirname);

import  './modules/web-server/server';


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
// //nodes engine
// // if (config.nodesEngine.enable) {
require('./public/nodes/nodes-engine');
require('./public/nodes/nodes');
require('./public/nodes/nodes/base');
require('./public/nodes/nodes/math');
require('./modules/test').test();
