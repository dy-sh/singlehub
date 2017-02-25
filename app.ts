/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

//source map for node typescript debug
require('source-map-support').install();

console.log("----------------------------- MyNodes -----------------------------");


let config = require('./config.json');
import {Server} from './modules/web-server/server';
import {Container, Side} from './public/nodes/container'
import {Database} from "./public/interfaces/database";

//add app root dir to global
import * as path from 'path';
(<any>global).__rootdirname = path.resolve(__dirname);


const log = require('logplease').create('app', {color: 2});


class App {
    db: Database;
    rootContainer: Container;
    server: Server;

    constructor() {

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

    registerNodes() {
        require('./public/nodes/nodes/index');
        let types = Container.nodes_types ? Object.keys(Container.nodes_types).length : 0;
        log.debug("Registered " + types + " nodes types");

    }

    createRootContainer() {
        this.rootContainer = new Container(Side.server);
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
            db.getNodes(function (err, nodes) {
                if (!nodes)
                    return;

                for (let n of nodes) {

                    let cont = Container.containers[n.cid];
                    if (!cont)
                        cont = new Container(Side.server, n.cid);

                    cont.createNode(n.type, null, n);


                    // console.log(root.id);
                }

                let contCount = Container.containers ? Object.keys(Container.containers).length : 0;
                log.info("Imported " + contCount + " containers, " + nodes.length + " nodes from database");
            });
        });
    }
}

export let app = new App();







