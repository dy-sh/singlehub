/**
 * Created by derwish on 25.01.17.
 */


import * as socket from 'socket.io';
import * as http from 'http';
import {rootContainer, Container} from "../public/nodes/container";
import Utils from "../public/nodes/utils";
import {editor} from "../public/js/editor/node-editor";


export class NodesServerSocket {

    io: SocketIO.Server;

    constructor(server: http.Server) {
        let io = socket(server);
        this.io = io;

        io.on('connection', function (socket) {
            Utils.debug("New socket conection", "SOCKET");
            // socket.on('test message', function (msg) {
            //     io.emit('test message', msg + "2");
            // });

            socket.on('node-message-to-back-side', function (n) {
                let node = rootContainer.getNodeById(n.id);
                if (!node) {
                    Utils.debugErr("Can't get node message from front-side. Node id does not exist", this);
                    return;
                }

                node.onGetMessageFromFrontSide(n.value);
            });

            socket.on("get-slots-values", function (cid) {
                let container = Container.containers[cid];

                let inputs_values = [];
                let outputs_values = [];
                for (let id in container._nodes) {
                    let node = container._nodes[id];
                    if (node.inputs) {
                        for (let i = 0; i < node.inputs.length; i++) {
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
                        for (let i = 0; i < node.outputs.length; i++) {
                            let data = node.outputs[i].data;
                            data = Utils.formatAndTrimValue(data);

                            outputs_values.push({
                                nodeId: node.id,
                                outputId: i,
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


