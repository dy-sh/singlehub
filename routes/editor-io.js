/**
 * Created by derwish on 25.01.17.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "socket.io", "../public/nodes/container", "../public/nodes/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const socket = require("socket.io");
    const container_1 = require("../public/nodes/container");
    const utils_1 = require("../public/nodes/utils");
    class NodesServerSocket {
        constructor(server) {
            let io = socket(server);
            this.io = io;
            io.on('connection', function (socket) {
                utils_1.default.debug("New socket conection", "SOCKET");
                // socket.on('test message', function (msg) {
                //     io.emit('test message', msg + "2");
                // });
                socket.on('node-message-to-back-side', function (n) {
                    let node = container_1.rootContainer.getNodeById(n.id);
                    if (!node) {
                        utils_1.default.debugErr("Cant get node message from front-side. Node id does not exist", this);
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
                            for (let i = 0; i < node.inputs.length; i++) {
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
                            for (let i = 0; i < node.outputs.length; i++) {
                                let data = node.outputs[i].data;
                                data = utils_1.default.formatAndTrimValue(data);
                                outputs_values.push({
                                    nodeId: node.id,
                                    outputId: i,
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