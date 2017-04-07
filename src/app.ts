import { Emitter } from "./public/js/emitter/emitter";
/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

//source map for node typescript debug
require('source-map-support').install();

console.log("----------------------------- SingleHub -----------------------------");


let config = require('../config.json');
import { Server } from './modules/server/server';
import { Container, Side } from './public/nodes/container'
import { Database } from "./public/interfaces/database";

//add app root dir to global
import * as path from 'path';
(<any>global).__rootdirname = path.resolve(__dirname);


const log = require('logplease').create('app', { color: 2 });


export class App extends Emitter {
    db: Database;
    rootContainer: Container;
    server: Server;

    constructor() {
        super();

        this.createServer();

        if (!config.firstRun)
            this.start();

        //this need for app. in other modules
        // setTimeout(this.lateConstructor.bind(this),100);
    }

    private lateConstructor() {
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
        this.server = new Server(this);
    }

    registerNodes() {
        require('./public/nodes/nodes/index');
        let types = Container.nodes_types ? Object.keys(Container.nodes_types).length : 0;
        log.debug("Registered " + types + " nodes types");

    }

    createRootContainer() {
        Container.showDebugOnCreateMessage = false;
        this.rootContainer = new Container(Side.server);
        Container.showDebugOnCreateMessage = true;

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


    loadDatabase(importNodes: boolean, callback?: Function) {

        let db = this.db;


        db.loadDatabase(function (err) {
            if (callback)
                callback(err);

            if (err) return;

            if (!importNodes)
                return;

            //get last container id
            db.getLastContainerId(function (err, id) {
                if (id)
                    Container.last_container_id = id;
            });

            //get last node id for root container
            db.getLastRootNodeId(function (err, id) {
                if (id)
                    app.rootContainer.last_node_id = id;
            });

            //import nodes
            db.getNodes(function (err, ser_nodes) {
                if (!ser_nodes)
                    return;

                let containers = Container.containers;

                let nodesCount = 0;

                Container.showDebugOnCreateMessage = false;

                for (let n of ser_nodes) {
                    let cont = containers[n.cid];
                    if (!cont)
                        cont = new Container(Side.server, n.cid);

                    nodesCount++;
                    cont.createNode(n.type, null, n);
                }

                Container.showDebugOnCreateMessage = true;

                for (let n of ser_nodes) {
                    let cont = Container.containers[n.cid];
                    let node = cont._nodes[n.id];
                    if (!node)
                        log.error("Node [" + n.cid + "/" + n.id + "] of type [" + n.type + "] is not created.");
                    else
                        node.restoreLinks();
                }

                let contCount = Object.keys(containers).length;
                if (containers[0]) contCount--;
                log.info("Imported " + contCount + " containers, " + nodesCount + " nodes from database");
            });
        });
    }
}

export let app = new App();







