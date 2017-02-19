/**
 * Created by derwish on 25.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'socket.io', "../public/nodes/container", "../public/nodes/utils", "../app"], factory);
    }
})(function (require, exports) {
    "use strict";
    const socket = require('socket.io');
    const container_1 = require("../public/nodes/container");
    const utils_1 = require("../public/nodes/utils");
    const app_1 = require("../app");
    const log = require('logplease').create('server', { color: 3 });
    class NodesServerSocket {
        constructor(server) {
            let io = socket(server);
            this.io = io;
            io.on('connection', function (socket) {
                log.debug("New socket conection");
                // socket.on('test message', function (msg) {
                //     io.emit('test message', msg + "2");
                // });
                //join client to container room
                socket.on('room', function (room) {
                    if (socket.room)
                        socket.leave(socket.room);
                    socket.room = room;
                    socket.join(room);
                    log.debug("Join to room [" + room + "]");
                });
                socket.on('node-message-to-back-side', function (n) {
                    let node = app_1.app.rootContainer.getNodeById(n.id);
                    if (!node) {
                        log.error("Can't get node message from front-side. Node id does not exist");
                        return;
                    }
                    node.onGetMessageFromFrontSide(n.value);
                });
                socket.on("get-slots-values", function (cid) {
                    let container = container_1.Container.containers[cid];
                    let inputs_values = [];
                    let outputs_values = [];
                    for (let id in container._nodes) {
                        let node = container._nodes[id];
                        if (node.inputs) {
                            for (let i in node.inputs) {
                                let data = node.inputs[i].data;
                                data = utils_1.default.formatAndTrimValue(data);
                                //todo convert and trim data
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
                    socket.emit("slots-values", slots_values);
                });
            });
        }
    }
    exports.NodesServerSocket = NodesServerSocket;
});
//# sourceMappingURL=editor-io.js.map