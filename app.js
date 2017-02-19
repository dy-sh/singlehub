(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./public/nodes/utils", 'path', './modules/web-server/server', './public/nodes/container', "./modules/database/neDbDatabase"], factory);
    }
})(function (require, exports) {
    "use strict";
    require('source-map-support').install();
    const utils_1 = require("./public/nodes/utils");
    /**
     * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
     */
    utils_1.default.debug("-------- MyNodes ----------");
    const path = require('path');
    global.__rootdirname = path.resolve(__dirname);
    const server_1 = require('./modules/web-server/server');
    utils_1.default.debug("Server started at port " + server_1.server.server.address().port, "SERVER");
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
    const container_1 = require('./public/nodes/container');
    // let rootContainer=require('./public/nodes/rootContainer');
    container_1.rootContainer.socket = server_1.server.socket.io;
    require('./public/nodes/nodes');
    require('./public/nodes/nodes/main');
    require('./public/nodes/nodes/debug');
    require('./public/nodes/nodes/math');
    // require('./modules/test').test();
    const neDbDatabase_1 = require("./modules/database/neDbDatabase");
    container_1.rootContainer.db = neDbDatabase_1.db;
    neDbDatabase_1.db.loadDatabase(function (err) {
        if (err) {
            utils_1.default.debugErr(err.message, "DATABASE");
            return;
        }
        utils_1.default.debug("Database loaded", "DATABASE");
        //add rootContainer if not exist
        neDbDatabase_1.db.getContainer(0, function (err, cont) {
            if (!cont) {
                utils_1.default.debug("Create root container", "DATABASE");
                neDbDatabase_1.db.addContainer(container_1.rootContainer);
            }
        });
        //import containers
        //add containers
        neDbDatabase_1.db.getContainers(function (err, containers) {
            if (!containers)
                return;
            for (let c of containers) {
                if (c.id == 0) {
                    container_1.rootContainer.configure(c);
                }
                else {
                }
            }
            utils_1.default.debug("Loaded " + containers.length + " containers", "DATABASE");
            //add nodes
            neDbDatabase_1.db.getNodes(function (err, nodes) {
                if (!nodes)
                    return;
                for (let n of nodes) {
                    let cont = container_1.Container.containers[n.cid];
                    cont.add_serialized_node(n);
                }
                utils_1.default.debug("Loaded " + nodes.length + " nodes", "DATABASE");
            });
        });
    });
});
//# sourceMappingURL=app.js.map