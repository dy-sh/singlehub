(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./public/js/emitter/emitter", './modules/server/server', './public/nodes/container', 'path'], factory);
    }
})(function (require, exports) {
    "use strict";
    const emitter_1 = require("./public/js/emitter/emitter");
    /**
     * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
     * License: http://www.gnu.org/licenses/gpl-3.0.txt
     */
    //source map for node typescript debug
    require('source-map-support').install();
    console.log("----------------------------- MyNodes -----------------------------");
    let config = require('./config.json');
    const server_1 = require('./modules/server/server');
    const container_1 = require('./public/nodes/container');
    //add app root dir to global
    const path = require('path');
    global.__rootdirname = path.resolve(__dirname);
    const log = require('logplease').create('app', { color: 2 });
    class App extends emitter_1.Emitter {
        constructor() {
            super();
            this.createServer();
            if (!config.firstRun)
                this.start();
            //this need for app. in other modules
            // setTimeout(this.lateConstructor.bind(this),100);
        }
        lateConstructor() {
            this.createServer();
            if (!config.firstRun)
                this.start();
        }
        start() {
            if (!this.rootContainer) {
                this.registerNodes();
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
            this.emit('started');
            this.rootContainer.run();
            //add test nodes
            // require('./modules/test').test();
            //mysensors gateway
            // if (config.gateway.mysensors.serial.enable) {
            // 	mys_gateway.connectToSerialPort(config.gateway.mysensors.serial.port, config.gateway.mysensors.serial.baudRate);
            // }
        }
        createServer() {
            this.server = new server_1.Server(this);
        }
        registerNodes() {
            require('./public/nodes/nodes/index');
            let types = container_1.Container.nodes_types ? Object.keys(container_1.Container.nodes_types).length : 0;
            log.debug("Registered " + types + " nodes types");
        }
        createRootContainer() {
            this.rootContainer = new container_1.Container(container_1.Side.server);
            if (this.server.editorSocket)
                this.rootContainer.server_editor_socket = this.server.editorSocket.io;
            if (this.server.dashboardSocket)
                this.rootContainer.server_dashboard_socket = this.server.dashboardSocket.io;
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
                db.getNodes(function (err, ser_nodes) {
                    if (!ser_nodes)
                        return;
                    let containers = container_1.Container.containers;
                    let nodesCount = 0;
                    for (let n of ser_nodes) {
                        let cont = containers[n.cid];
                        if (!cont)
                            cont = new container_1.Container(container_1.Side.server, n.cid);
                        nodesCount++;
                        cont.createNode(n.type, null, n);
                    }
                    for (let n of ser_nodes) {
                        let cont = container_1.Container.containers[n.cid];
                        let node = cont._nodes[n.id];
                        if (!node)
                            log.error("Node [" + n.cid + "/" + n.id + "] is not created.");
                        node.restoreLinks();
                    }
                    let contCount = Object.keys(containers).length;
                    if (containers[0])
                        contCount--;
                    log.info("Imported " + contCount + " containers, " + nodesCount + " nodes from database");
                });
            });
        }
    }
    exports.App = App;
    exports.app = new App();
});
//# sourceMappingURL=app.js.map