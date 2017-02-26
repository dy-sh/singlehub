/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.01.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../public/nodes/container", "../../app", "../../public/nodes/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../public/nodes/container");
    const app_1 = require("../../app");
    const utils_1 = require("../../public/nodes/utils");
    const log = require('logplease').create('server', { color: 3 });
    class EditorServerSocket {
        constructor(io_root) {
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
                    if (socket.room)
                        socket.leave(socket.room);
                    socket.room = room;
                    socket.join(room);
                    log.debug("Join to editor room [" + room + "]");
                });
                socket.on('node-message-to-server-side', function (n) {
                    let cont = container_1.Container.containers[n.cid];
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
                    let cont = container_1.Container.containers[n.cid];
                    if (!cont) {
                        log.error("Can't send node message to editor-side. Container id [" + n.cid + "] does not exist");
                        return;
                    }
                    let node = cont.getNodeById(n.id);
                    if (!node) {
                        log.error("Can't send node message to editor-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                        return;
                    }
                    app_1.app.server.editorSocket.io.in(n.cid).emit('node-message-to-editor-side', n);
                });
                //redirect message
                socket.on('node-message-to-dashboard-side', function (n) {
                    console.log(n);
                    let cont = container_1.Container.containers[n.cid];
                    if (!cont) {
                        log.error("Can't send node message to dashboard-side. Container id [" + n.cid + "] does not exist");
                        return;
                    }
                    let node = cont.getNodeById(n.id);
                    if (!node) {
                        log.error("Can't send node message to dashboard-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                        return;
                    }
                    app_1.app.server.dashboardSocket.io.in(n.cid).emit('node-message-to-dashboard-side', n);
                });
                socket.on("get-nodes-io-values", function (cid) {
                    let slots_values = that.getNodesIOValues(cid);
                    socket.emit("nodes-io-values", slots_values);
                });
            });
        }
        getNodesIOValues(cid) {
            let container = container_1.Container.containers[cid];
            if (!container || !container._nodes)
                return;
            let inputs_values = [];
            let outputs_values = [];
            for (let id in container._nodes) {
                let node = container._nodes[id];
                if (node.inputs) {
                    for (let i in node.inputs) {
                        let data = node.inputs[i].data;
                        data = utils_1.default.formatAndTrimValue(data);
                        inputs_values.push({
                            nodeId: node.id,
                            inputId: i,
                            data: data
                        });
                    }
                }
                if (node.outputs) {
                    for (let o in node.outputs) {
                        let data = node.outputs[o].data;
                        data = utils_1.default.formatAndTrimValue(data);
                        outputs_values.push({
                            nodeId: node.id,
                            outputId: o,
                            data: data
                        });
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
    exports.EditorServerSocket = EditorServerSocket;
});
//# sourceMappingURL=editor-server-socket.js.map