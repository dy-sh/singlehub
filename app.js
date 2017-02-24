(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", './public/nodes/container', 'path'], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
     */
    //source map for node typescript debug
    require('source-map-support').install();
    console.log("----------------------------- MyNodes -----------------------------");
    let config = require('./config.json');
    const container_1 = require('./public/nodes/container');
    //add app root dir to global
    const path = require('path');
    global.__rootdirname = path.resolve(__dirname);
    const log = require('logplease').create('app', { color: 2 });
    class App {
        constructor() {
            this.createServer();
            if (!config.firstRun)
                this.start();
        }
        start() {
            if (!this.rootContainer) {
                this.createNodes();
                this.createRootContainer();
            }
            if (config.dataBase.enable) {
                if (!this.db)
                    this.connectDatabase();
                if (this.db)
                    this.loadDatabase(true);
            }
            if (this.rootContainer && this.db)
                this.rootContainer.db = this.db;
            //add test nodes
            // require('./modules/test').test();
            //mysensors gateway
            // if (config.gateway.mysensors.serial.enable) {
            // 	mys_gateway.connectToSerialPort(config.gateway.mysensors.serial.port, config.gateway.mysensors.serial.baudRate);
            // }
        }
        createServer() {
            this.server = require('./modules/web-server/server').server;
        }
        createNodes() {
            require('./public/nodes/nodes');
            require('./public/nodes/nodes/main');
            require('./public/nodes/nodes/debug');
            require('./public/nodes/nodes/math');
        }
        createRootContainer() {
            this.rootContainer = new container_1.Container();
            this.rootContainer.socket = this.server.socket.io;
        }
        connectDatabase() {
            let db;
            if (config.dataBase.useInternalDb)
                db = require("./modules/database/neDbDatabase").db;
            else
                throw ("External db not implementer yet");
            this.db = db;
        }
        loadDatabase(importNodes, callback) {
            let db = this.db;
            db.loadDatabase(function (err) {
                if (callback)
                    callback(err);
                if (err)
                    return;
                if (!importNodes)
                    return;
                //get last container id
                db.getLastContainerId(function (err, id) {
                    if (id)
                        container_1.Container.last_container_id = id;
                });
                //get last node id for root container
                db.getLastRootNodeId(function (err, id) {
                    if (id)
                        exports.app.rootContainer.last_node_id = id;
                });
                //import nodes
                db.getNodes(function (err, nodes) {
                    if (!nodes)
                        return;
                    for (let n of nodes) {
                        let conts = container_1.Container.containers;
                        let root = container_1.Container.containers[0];
                        let cont = container_1.Container.containers[n.cid];
                        if (!cont)
                            cont = new container_1.Container(n.cid);
                        cont.add_serialized_node(n, true);
                    }
                    let contCount = Object.keys(container_1.Container.containers).length;
                    log.debug("Created " + contCount + " containers, " + nodes.length + " nodes");
                });
            });
        }
    }
    exports.app = new App();
});
//# sourceMappingURL=app.js.map