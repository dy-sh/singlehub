"use strict";
/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
//source map for node typescript debug
require('source-map-support').install();
console.log("----------------------------- MyNodes -----------------------------");
var config = require('./config.json');
var container_1 = require('./public/nodes/container');
//add app root dir to global
var path = require('path');
global.__rootdirname = path.resolve(__dirname);
var log = require('logplease').create('app', { color: 2 });
var App = (function () {
    function App() {
        this.createServer();
        if (!config.firstRun)
            this.start();
    }
    App.prototype.start = function () {
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
    };
    App.prototype.createServer = function () {
        this.server = require('./modules/web-server/server').server;
    };
    App.prototype.createNodes = function () {
        require('./public/nodes/nodes');
        require('./public/nodes/nodes/main');
        require('./public/nodes/nodes/debug');
        require('./public/nodes/nodes/math');
    };
    App.prototype.createRootContainer = function () {
        this.rootContainer = new container_1.Container();
        this.rootContainer.socket = this.server.socket.io;
    };
    App.prototype.connectDatabase = function () {
        var db;
        if (config.dataBase.useInternalDb)
            db = require("./modules/database/neDbDatabase").db;
        else
            throw ("External db not implementer yet");
        this.db = db;
    };
    App.prototype.loadDatabase = function (importNodes, callback) {
        var db = this.db;
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
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var n = nodes_1[_i];
                    var conts = container_1.Container.containers;
                    var root = container_1.Container.containers[0];
                    var cont = container_1.Container.containers[n.cid];
                    if (!cont)
                        cont = new container_1.Container(n.cid);
                    cont.add_serialized_node(n, true);
                }
                var contCount = Object.keys(container_1.Container.containers).length;
                log.debug("Created " + contCount + " containers, " + nodes.length + " nodes");
            });
        });
    };
    return App;
}());
exports.app = new App();
