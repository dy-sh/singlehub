/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.01.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Container } from "../../public/nodes/container";
import { Node } from "../../public/nodes/node";
import app from "../../app";
import Utils from "../../public/nodes/utils";
import Namespace = SocketIO.Namespace;


const log = require('logplease').create('server', { color: 3 });


export class EditorServerSocket {

    io_root: SocketIO.Server;
    io: Namespace;

    constructor(io_root: SocketIO.Server) {
        this.io_root = io_root;
        let io = io_root.of('/editor');
        this.io = io;

        let that = this;

        io.on('connection', function (socket) {
            log.debug("New socket connection to editor");
            // socket.on('test message', function (msg) {
            //     io.emit('test message', msg + "2");
            // });

            //join client to container room
            socket.on('room', function (room) {
                if ((<any>socket).room != null) {
                    socket.leave((<any>socket).room, function () {//it is necessary to waiting for leave room before join only if it's the same room (same id)
                        (<any>socket).room = room;
                        socket.join(room);
                        log.debug("Switch editor room to [" + room + "]");
                    });
                } else {
                    (<any>socket).room = room;
                    socket.join(room);
                    log.debug("Join to editor room [" + room + "]");
                }
            });

            socket.on('nodeMessageToServer', function (n) {
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

                node['onGetMessageToServerSide'](n.value);
            });


            //redirect message
            socket.on('nodeMessageToEditor', function (n) {
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

                app.server.editorSocket.io.in(n.cid).emit('nodeMessageToEditor', n);

            });

            //redirect message
            socket.on('nodeMessageToDashboard', function (n) {
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

                app.server.dashboardSocket.io.in(n.cid).emit('nodeMessageToDashboard', n);
            });


            socket.on("get-nodes-io-values", function (cid) {
                let slots_values = that.getNodesIOValues(cid);
                socket.emit("nodes-io-values", slots_values);
            });
        });
    }


    getNodesIOValues(cid: number): any {
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

        return slots_values;
    }
}


