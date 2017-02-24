/**
 * Created by derwish on 25.01.17.
 */


import * as socket from 'socket.io';
import * as http from 'http';
import {Container} from "../public/nodes/container";
import Utils from "../public/nodes/utils";
import {app} from "../app";

const log = require('logplease').create('server', {color: 3});


export class NodesServerSocket {

    io: SocketIO.Server;

    constructor(server: http.Server) {
        let io = socket(server);
        this.io = io;

        io.on('connection', function (socket) {
            log.debug("New socket conection");
            // socket.on('test message', function (msg) {
            //     io.emit('test message', msg + "2");
            // });

            //join client to container room
            socket.on('room', function (room) {
                if ((<any>socket).room)
                    socket.leave((<any>socket).room);

                (<any>socket).room = room;
                socket.join(room);
                log.debug("Join to room [" + room + "]");
            });

            socket.on('node-message-to-back-side', function (n) {
                let node = app.rootContainer.getNodeById(n.id);
                if (!node) {
                    log.error("Can't get node message from front-side. Node id does not exist");
                    return;
                }

                node.onGetMessageFromFrontSide(n.value);
            });

            socket.on("get-slots-values", function (cid) {
                let container = Container.containers[cid];
                if (!container || !container._nodes)
                    return;

                let inputs_values = [];
                let outputs_values = [];
                for (let id in container._nodes) {
                    let node = container._nodes[id];
                    if (node.inputs) {
                        for (let i in node.inputs) {
                            let data = node.inputs[i].data;
                            data = Utils.formatAndTrimValue(data);

                            //todo convert and trim data
                            inputs_values.push({
                                nodeId: node.id,
                                inputId: i,
                                data: data
                            })
                        }
                    }

                    if (node.outputs) {
                        for (let o in node.outputs) {
                            let data = node.outputs[o].data;
                            data = Utils.formatAndTrimValue(data);

                            outputs_values.push({
                                nodeId: node.id,
                                outputId: o,
                                data: data
                            })
                        }
                    }
                }

                let slots_values = {
                    cid: cid,
                    inputs: inputs_values,
                    outputs: outputs_values
                };
                socket.emit("slots-values", slots_values);
            });
        });


    }
}


