/**
 * Created by derwish on 25.01.17.
 */
"use strict";
var socket = require('socket.io');
var container_1 = require("../public/nodes/container");
var utils_1 = require("../public/nodes/utils");
var app_1 = require("../app");
var log = require('logplease').create('server', { color: 3 });
var EditorServerSocket = (function () {
    function EditorServerSocket(server) {
        var io = socket(server);
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
                var node = app_1.app.rootContainer.getNodeById(n.id);
                if (!node) {
                    log.error("Can't get node message from front-side. Node id does not exist");
                    return;
                }
                node.onGetMessageFromFrontSide(n.value);
            });
            socket.on("get-slots-values", function (cid) {
                var container = container_1.Container.containers[cid];
                if (!container || !container._nodes)
                    return;
                var inputs_values = [];
                var outputs_values = [];
                for (var id in container._nodes) {
                    var node = container._nodes[id];
                    if (node.inputs) {
                        for (var i in node.inputs) {
                            var data = node.inputs[i].data;
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
                        for (var o in node.outputs) {
                            var data = node.outputs[o].data;
                            data = utils_1.default.formatAndTrimValue(data);
                            outputs_values.push({
                                nodeId: node.id,
                                outputId: o,
                                data: data
                            });
                        }
                    }
                }
                var slots_values = {
                    cid: cid,
                    inputs: inputs_values,
                    outputs: outputs_values
                };
                socket.emit("slots-values", slots_values);
            });
        });
    }
    return EditorServerSocket;
}());
exports.EditorServerSocket = EditorServerSocket;
