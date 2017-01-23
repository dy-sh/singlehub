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
// require('./public/nodes/nodes-engine');
// require('./public/nodes/nodes');
// require('./public/nodes/nodes/base');
// require('./public/nodes/nodes/math');
// require('modules/test').test();


import * as http from 'http';
import * as debug from 'debug';
//
//
// debug('ts-express:server');
//
// const port = normalizePort(process.env.PORT || 3000);
// App.set('port', port);
//
// const server = http.createServer(App);
// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);
//
// function normalizePort(val: number|string): number|string|boolean {
//     let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
//     if (isNaN(port)) return val;
//     else if (port >= 0) return port;
//     else return false;
// }
//
// function onError(error: NodeJS.ErrnoException): void {
//     if (error.syscall !== 'listen') throw error;
//     let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
//     switch(error.code) {
//         case 'EACCES':
//             console.error(`${bind} requires elevated privileges`);
//             process.exit(1);
//             break;
//         case 'EADDRINUSE':
//             console.error(`${bind} is already in use`);
//             process.exit(1);
//             break;
//         default:
//             throw error;
//     }
// }
//
// function onListening(): void {
//     let addr = server.address();
//     let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
//     debug(`Listening on ${bind}`);
// }


