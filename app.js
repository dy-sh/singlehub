/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'path', './modules/web-server/server'], factory);
    }
})(function (require, exports) {
    "use strict";
    console.log("-------- MyNodes ----------");
    const path = require('path');
    global.__rootdirname = path.resolve(__dirname);
    const server_1 = require('./modules/web-server/server');
    console.log("Server started at port " + server_1.server.server.address().port);
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
});
//# sourceMappingURL=app.js.map