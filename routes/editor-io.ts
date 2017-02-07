/**
 * Created by derwish on 25.01.17.
 */


import * as socket from 'socket.io';
import * as http from 'http';
import {engine} from "../public/nodes/nodes-engine";
import Utils from "../public/nodes/utils";


export class NodesServerSocket {

    io: SocketIO.Server;

    constructor(server: http.Server) {
        let io = socket(server);
        this.io = io;

        io.on('connection', function (socket) {
            Utils.debug("New socket conection","SOCKET");
            // socket.on('test message', function (msg) {
            //     io.emit('test message', msg + "2");
            // });

            socket.on('node-value-to-backside', function (n) {
                let node = engine.getNodeById(n.id);
                if (!node) {
                    Utils.debugErr("Cant get node message from front-side. Node does not exist", "SOCKET");
                    return;
                }

                node.onGetValueToBackside(n.value);
            });
        });


    }
}


