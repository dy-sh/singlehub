/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var container_1 = require("../../nodes/container");
var log = Logger.create('client', { color: 3 });
var EditorClientSocket = (function () {
    function EditorClientSocket(editor) {
        var SLOTS_VALUES_INTERVAL = 200;
        this.editor = editor;
        var socket = io('/editor');
        this.socket = socket;
        var that = this;
        setInterval(function () {
            if (that.socket
                && that.socket.connected
                && editor.showNodesIOValues
                && editor.isRunning)
                that.sendGetSlotsValues();
        }, SLOTS_VALUES_INTERVAL);
        socket.on('connect', function () {
            log.debug("Connected to socket");
            that.sendJoinContainerRoom(editor.renderer.container.id);
            editor.updateNodesLabels();
        });
        //
        // socket.on('connect', function () {
        //
        //     if (this.socketConnected == false) {
        //         noty({text: 'Connected to web server.', type: 'alert'});
        //         //waiting while server initialized and read db
        //         setTimeout(function () {
        //             this.getNodes();
        //             this.getGatewayInfo();
        //             $("#main").fadeIn(300);
        //         }, 2000);
        //     }
        //     this.socketConnected = true;
        // });
        //
        // socket.on('disconnect', function () {
        //     $("#main").fadeOut(300);
        //     noty({text: 'Web server is not responding!', type: 'error'});
        //     this.socketConnected = false;
        // });
        socket.on('node-create', function (n) {
            var container = container_1.Container.containers[n.cid];
            if (!container) {
                log.error("Can't create node. Container id [" + n.cid + "] not found.");
                return;
            }
            var node = container.createNode(n.type, { pos: n.pos });
        });
        socket.on('nodes-delete', function (data) {
            var container = container_1.Container.containers[data.cid];
            if (!container) {
                log.error("Can't delete node. Container id [" + data.cid + "] not found.");
                return;
            }
            for (var _i = 0, _a = data.nodes; _i < _a.length; _i++) {
                var id = _a[_i];
                var node = container.getNodeById(id);
                if (!node) {
                    log.error("Can't delete node. Node id [" + data.cid + "/" + id + "] not found.");
                    return;
                }
                container.remove(node);
            }
        });
        socket.on('node-update-position', function (n) {
            var container = container_1.Container.containers[n.cid];
            if (!container) {
                log.error("Can't update node. Container id [" + n.cid + "] not found.");
                return;
            }
            var node = container.getNodeById(n.id);
            if (!node) {
                log.error("Can't update node. Node id [" + n.cid + "/" + n.id + "] not found.");
                return;
            }
            if (node.pos != n.pos) {
                node.pos = n.pos;
                node.setDirtyCanvas(true, true);
            }
        });
        socket.on('node-update-size', function (n) {
            var container = container_1.Container.containers[n.cid];
            if (!container) {
                log.error("Can't update node. Container id [" + n.cid + "] not found.");
                return;
            }
            var node = container.getNodeById(n.id);
            if (!node) {
                log.error("Can't update node. Node id [" + n.cid + "/" + n.id + "] not found.");
                return;
            }
            if (node.pos != n.pos) {
                node.size = n.size;
                node.setDirtyCanvas(true, true);
            }
        });
        socket.on('node-settings', function (n) {
            var container = container_1.Container.containers[n.cid];
            if (!container) {
                log.error("Can't set node settings. Container id [" + n.cid + "] not found.");
                return;
            }
            var node = container.getNodeById(n.id);
            if (!node) {
                log.error("Can't set node settings. Node id [" + n.cid + "/" + n.id + "] not found.");
                return;
            }
            node.settings = n.settings;
            if (node['onSettingsChanged'])
                node['onSettingsChanged']();
            node.setDirtyCanvas(true, true);
        });
        socket.on('nodes-move-to-new-container', function (data) {
            var container = container_1.Container.containers[data.cid];
            if (!container) {
                log.error("Can't move nodes to container. Container id [" + data.cid + "] not found.");
                return;
            }
            container.mooveNodesToNewContainer(data.ids, data.pos);
        });
        socket.on('node-message-to-editor-side', function (n) {
            var container = container_1.Container.containers[n.cid];
            if (!container) {
                log.error("Can't send node message. Container id [" + n.cid + "] not found.");
                return;
            }
            var node = container.getNodeById(n.id);
            if (!node) {
                log.error("Can't send node message. Node id [" + n.cid + "/" + n.id + "] not found.");
                return;
            }
            if (node['onGetMessageToEditorSide'])
                node['onGetMessageToEditorSide'](n.value);
        });
        socket.on('link-create', function (data) {
            var container = container_1.Container.containers[data.cid];
            if (!container) {
                log.error("Can't create link. Container id [" + data.cid + "] not found.");
                return;
            }
            var node = container.getNodeById(data.link.origin_id);
            if (!node) {
                log.error("Can't create link. Node id [" + data.cid + "/" + data.id + "] not found.");
                return;
            }
            node.connect(data.link.origin_slot, data.link.target_id, data.link.target_slot);
        });
        socket.on('link-delete', function (data) {
            var container = container_1.Container.containers[data.cid];
            if (!container) {
                log.error("Can't delete link. Container id [" + data.cid + "] not found.");
                return;
            }
            var node = container.getNodeById(data.link.target_id);
            if (!node) {
                log.error("Can't delete link. Node id [" + data.cid + "/" + data.id + "] not found.");
                return;
            }
            node.disconnectInput(data.link.target_slot);
        });
        socket.on('container-run', function (l) {
            editor.onContainerRun();
        });
        socket.on('container-run-step', function (l) {
            editor.onContainerRunStep();
        });
        socket.on('container-stop', function (l) {
            editor.onContainerStop();
        });
        socket.on('nodes-active', function (data) {
            var container = container_1.Container.containers[data.cid];
            if (!container)
                return;
            for (var _i = 0, _a = data.ids; _i < _a.length; _i++) {
                var id = _a[_i];
                var node = container.getNodeById(id);
                if (!node)
                    continue;
                editor.renderer.showNodeActivity(node);
            }
        });
        socket.on('nodes-io-values', function (slots_values) {
            if (!that.editor.showNodesIOValues)
                return;
            var container = container_1.Container.containers[slots_values.cid];
            if (!container)
                return;
            if (slots_values.inputs) {
                for (var _i = 0, _a = slots_values.inputs; _i < _a.length; _i++) {
                    var slot = _a[_i];
                    var node = container.getNodeById(slot.nodeId);
                    if (!node)
                        continue;
                    if (!slot.data)
                        slot.data = "";
                    node.inputs[slot.inputId].label = slot.data;
                    node.setDirtyCanvas(true, true);
                }
            }
            if (slots_values.outputs) {
                for (var _b = 0, _c = slots_values.outputs; _b < _c.length; _b++) {
                    var slot = _c[_b];
                    var node = container.getNodeById(slot.nodeId);
                    if (!node)
                        continue;
                    if (!slot.data)
                        slot.data = "";
                    node.outputs[slot.outputId].label = slot.data;
                    node.setDirtyCanvas(true, true);
                }
            }
        });
        socket.on('nodes-clone', function (data) {
            var container = container_1.Container.containers[data.cid];
            if (!container) {
                log.error("Can't clone node. Container id [" + data.cid + "] not found.");
                return;
            }
            for (var _i = 0, _a = data.nodes; _i < _a.length; _i++) {
                var id = _a[_i];
                var node = container.getNodeById(id);
                if (!node) {
                    log.error("Can't clone node. Node id [" + data.cid + "/" + id + "] not found.");
                    return;
                }
                node.clone();
            }
        });
        // socket.on('gateway-connected', function () {
        //     noty({text: 'Gateway connected.', type: 'alert', timeout: false});
        // });
        //
        // socket.on('gateway-disconnected', function () {
        //     noty({text: 'Gateway disconnected!', type: 'error', timeout: false});
        // });
        // this.getGatewayInfo();
        $("#sendButton").click(function () {
            var gr = JSON.stringify(this.rootContainer.serialize());
            $.ajax({
                url: '/api/editor',
                type: 'POST',
                data: { json: gr.toString() }
            }).done(function () {
            });
        });
    }
    //
    // getGatewayInfo(): void {
    //     $.ajax({
    //         url: "/api/mysensors/gateway/",
    //         success: function (gatewayInfo) {
    //             if (gatewayInfo.state == 1 || gatewayInfo.state == 2) {
    //                 noty({text: 'Gateway is not connected!', type: 'error', timeout: false});
    //             }
    //         }
    //     });
    // }
    EditorClientSocket.prototype.getNodes = function (callback) {
        var root_id = 0;
        $.ajax({
            url: "/api/editor/c/" + root_id,
            success: function (nodes) {
                var rootContainer = container_1.Container.containers[root_id];
                rootContainer.configure(nodes, false);
                if (callback)
                    callback(nodes);
            }
        });
    };
    EditorClientSocket.prototype.getContainerState = function () {
        var that = this;
        $.ajax({
            url: "/api/editor/state",
            success: function (state) {
                if (state.isRunning)
                    that.editor.onContainerRun();
                else
                    that.editor.onContainerStop();
            }
        });
    };
    EditorClientSocket.prototype.sendCreateNode = function (type, position) {
        var that = this;
        var json = JSON.stringify({ type: type, position: position, container: that.editor.renderer.container.id });
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/",
            contentType: 'application/json',
            type: 'POST',
            data: json
        });
    };
    ;
    EditorClientSocket.prototype.sendRemoveNode = function (node) {
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/" + node.id,
            type: 'DELETE'
        });
    };
    ;
    EditorClientSocket.prototype.sendRemoveNodes = function (ids) {
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/",
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify(ids)
        });
    };
    ;
    EditorClientSocket.prototype.sendMoveToNewContainer = function (ids, pos) {
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/move/",
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ ids: ids, pos: pos })
        });
    };
    ;
    EditorClientSocket.prototype.sendUpdateNodePosition = function (node) {
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/" + node.id + "/position",
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify({ position: node.pos })
        });
    };
    ;
    EditorClientSocket.prototype.sendUpdateNodeSize = function (node) {
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/" + node.id + "/size",
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify({ size: node.size })
        });
    };
    ;
    EditorClientSocket.prototype.sendCreateLink = function (origin_id, origin_slot, target_id, target_slot) {
        var data = {
            origin_id: origin_id,
            origin_slot: origin_slot,
            target_id: target_id,
            target_slot: target_slot,
        };
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/l/",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    };
    ;
    EditorClientSocket.prototype.sendRemoveLink = function (origin_id, origin_slot, target_id, target_slot) {
        var data = {
            origin_id: origin_id,
            origin_slot: origin_slot,
            target_id: target_id,
            target_slot: target_slot,
        };
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/l/",
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify(data)
        });
    };
    ;
    //---------------------------------------------------
    EditorClientSocket.prototype.sendRunContainer = function () {
        $.ajax({
            url: "/api/editor/run",
            type: 'POST'
        });
    };
    ;
    EditorClientSocket.prototype.sendStopContainer = function () {
        $.ajax({
            url: "/api/editor/stop",
            type: 'POST'
        });
    };
    ;
    EditorClientSocket.prototype.sendStepContainer = function () {
        $.ajax({
            url: "/api/editor/step",
            type: 'POST'
        });
    };
    ;
    //---------------------------------------------------
    EditorClientSocket.prototype.sendCloneNode = function (ids) {
        var that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/clone",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(ids)
        });
    };
    ;
    //
    //
    // calculateNodeMinHeight(node: Node): number {
    //
    //     let slotsMax = (node.outputs.length > node.inputs.length) ? node.outputs.length : node.inputs.length;
    //     if (slotsMax == 0)
    //         slotsMax = 1;
    //
    //     let height = Nodes.options.NODE_SLOT_HEIGHT * slotsMax;
    //
    //     return height + 5;
    // }
    //
    //
    // findFreeSpaceY(node: Node): number {
    //
    //
    //     let nodes = this.container._nodes;
    //
    //
    //     node.pos = [0, 0];
    //
    //     let result = Nodes.options.START_POS;
    //
    //
    //     for (let i = 0; i < nodes.length; i++) {
    //         let needFromY = result;
    //         let needToY = result + node.size[1];
    //
    //         if (node.id == nodes[i].id)
    //             continue;
    //
    //         if (!nodes[i].pos)
    //             continue;
    //
    //         if (nodes[i].pos[0] > Nodes.options.NODE_WIDTH + 20 + Nodes.options.START_POS)
    //             continue;
    //
    //         let occupyFromY = nodes[i].pos[1] - Nodes.options.FREE_SPACE_UNDER;
    //         let occupyToY = nodes[i].pos[1] + nodes[i].size[1];
    //
    //         if (occupyFromY <= needToY && occupyToY >= needFromY) {
    //             result = occupyToY + Nodes.options.FREE_SPACE_UNDER;
    //             i = -1;
    //         }
    //     }
    //
    //     return result;
    //
    // }
    EditorClientSocket.prototype.sendGetSlotsValues = function () {
        this.socket.emit("get-nodes-io-values", this.editor.renderer.container.id);
    };
    EditorClientSocket.prototype.sendJoinContainerRoom = function (cont_id) {
        log.debug("Join to editor room [" + cont_id + "]");
        this.socket.emit('room', cont_id);
    };
    return EditorClientSocket;
}());
exports.EditorClientSocket = EditorClientSocket;
