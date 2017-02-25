/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.01.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import * as socket from 'socket.io';
import * as http from 'http';
import {Container} from "../public/nodes/container";
import Utils from "../public/nodes/utils";
import {app} from "../app";

const log = require('logplease').create('server', {color: 3});


export class EditorServerSocket {

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

            socket.on('node-message-to-server-side', function (n) {
                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to server-side. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to server-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                node.onGetMessageToServerSide(n.value);
            });


            //redirect message
            socket.on('node-message-to-editor-side', function (n) {
                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to editor-side. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to editor-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                let room = "editor-container-" + n.cid;
                app.server.socket.io.sockets.in(room).emit('node-message-to-editor-side', n);

            });

            //redirect message
            socket.on('node-message-to-dashboard-side', function (n) {
                console.log(n)

                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to dashboard-side. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to dashboard-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                let room = "dashboard-container-" + n.cid;
                app.server.socket.io.sockets.in(room).emit('node-message-to-dashboard-side', n);
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


