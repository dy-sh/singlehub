"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var emitter_1 = require("./public/js/emitter/emitter");
/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
//source map for node typescript debug
require('source-map-support').install();
console.log("----------------------------- MyNodes -----------------------------");
var config = require('./config.json');
var server_1 = require('./modules/server/server');
var container_1 = require('./public/nodes/container');
//add app root dir to global
var path = require('path');
global.__rootdirname = path.resolve(__dirname);
var log = require('logplease').create('app', { color: 2 });
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        _super.call(this);
        this.createServer();
        if (!config.firstRun)
            this.start();
        //this need for app. in other modules
        // setTimeout(this.lateConstructor.bind(this),100);
    }
    App.prototype.lateConstructor = function () {
        this.createServer();
        if (!config.firstRun)
            this.start();
    };
    App.prototype.start = function () {
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
    };
    App.prototype.createServer = function () {
        this.server = new server_1.Server(this);
    };
    App.prototype.registerNodes = function () {
        require('./public/nodes/nodes/index');
        var types = container_1.Container.nodes_types ? Object.keys(container_1.Container.nodes_types).length : 0;
        log.debug("Registered " + types + " nodes types");
    };
    App.prototype.createRootContainer = function () {
        this.rootContainer = new container_1.Container(container_1.Side.server);
        if (this.server.editorSocket)
            this.rootContainer.server_editor_socket = this.server.editorSocket.io;
        if (this.server.dashboardSocket)
            this.rootContainer.server_dashboard_socket = this.server.dashboardSocket.io;
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
            db.getNodes(function (err, ser_nodes) {
                if (!ser_nodes)
                    return;
                for (var _i = 0, ser_nodes_1 = ser_nodes; _i < ser_nodes_1.length; _i++) {
                    var n = ser_nodes_1[_i];
                    var cont = container_1.Container.containers[n.cid];
                    if (!cont)
                        cont = new container_1.Container(container_1.Side.server, n.cid);
                    cont.createNode(n.type, null, n);
                }
                for (var _a = 0, ser_nodes_2 = ser_nodes; _a < ser_nodes_2.length; _a++) {
                    var n = ser_nodes_2[_a];
                    var cont = container_1.Container.containers[n.cid];
                    var node = cont._nodes[n.id];
                    node.restoreLinks();
                }
                var contCount = container_1.Container.containers ? Object.keys(container_1.Container.containers).length : 0;
                log.info("Imported " + (contCount - 1) + " containers, " + ser_nodes.length + " nodes from database");
            });
        });
    };
    return App;
}(emitter_1.Emitter));
exports.App = App;
exports.app = new App();
