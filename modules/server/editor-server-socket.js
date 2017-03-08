/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.01.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var container_1 = require("../../public/nodes/container");
var app_1 = require("../../app");
var utils_1 = require("../../public/nodes/utils");
var log = require('logplease').create('server', { color: 3 });
var EditorServerSocket = (function () {
    function EditorServerSocket(io_root) {
        this.io_root = io_root;
        var io = io_root.of('/editor');
        this.io = io;
        var that = this;
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
                var cont = container_1.Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to server-side. Container id [" + n.cid + "] does not exist");
                    return;
                }
                var node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to server-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }
                node['onGetMessageToServerSide'](n.value);
            });
            //redirect message
            socket.on('node-message-to-editor-side', function (n) {
                var cont = container_1.Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to editor-side. Container id [" + n.cid + "] does not exist");
                    return;
                }
                var node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to editor-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }
                app_1.app.server.editorSocket.io.in(n.cid).emit('node-message-to-editor-side', n);
            });
            //redirect message
            socket.on('node-message-to-dashboard-side', function (n) {
                console.log(n);
                var cont = container_1.Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to dashboard-side. Container id [" + n.cid + "] does not exist");
                    return;
                }
                var node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to dashboard-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }
                app_1.app.server.dashboardSocket.io.in(n.cid).emit('node-message-to-dashboard-side', n);
            });
            socket.on("get-nodes-io-values", function (cid) {
                var slots_values = that.getNodesIOValues(cid);
                socket.emit("nodes-io-values", slots_values);
            });
        });
    }
    EditorServerSocket.prototype.getNodesIOValues = function (cid) {
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
        return slots_values;
    };
    return EditorServerSocket;
}());
exports.EditorServerSocket = EditorServerSocket;
