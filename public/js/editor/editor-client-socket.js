/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../nodes/container");
    let log = Logger.create('client', { color: 3 });
    class EditorClientSocket {
        constructor(editor) {
            let SLOTS_VALUES_INTERVAL = 200;
            this.editor = editor;
            let socket = io('/editor');
            this.socket = socket;
            let that = this;
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
                let container = container_1.Container.containers[n.cid];
                if (!container) {
                    log.error(`Can't create node. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.createNode(n.type, { pos: n.pos });
            });
            socket.on('nodes-delete', function (data) {
                let container = container_1.Container.containers[data.cid];
                if (!container) {
                    log.error(`Can't delete node. Container id [${data.cid}] not found.`);
                    return;
                }
                for (let id of data.nodes) {
                    let node = container.getNodeById(id);
                    if (!node) {
                        log.error(`Can't delete node. Node id [${data.cid}/${id}] not found.`);
                        return;
                    }
                    container.remove(node);
                }
            });
            socket.on('node-update-position', function (n) {
                let container = container_1.Container.containers[n.cid];
                if (!container) {
                    log.error(`Can't update node. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(n.id);
                if (!node) {
                    log.error(`Can't update node. Node id [${n.cid}/${n.id}] not found.`);
                    return;
                }
                if (node.pos != n.pos) {
                    node.pos = n.pos;
                    node.setDirtyCanvas(true, true);
                }
            });
            socket.on('node-update-size', function (n) {
                let container = container_1.Container.containers[n.cid];
                if (!container) {
                    log.error(`Can't update node. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(n.id);
                if (!node) {
                    log.error(`Can't update node. Node id [${n.cid}/${n.id}] not found.`);
                    return;
                }
                if (node.pos != n.pos) {
                    node.size = n.size;
                    node.setDirtyCanvas(true, true);
                }
            });
            socket.on('node-settings', function (n) {
                let container = container_1.Container.containers[n.cid];
                if (!container) {
                    log.error(`Can't set node settings. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(n.id);
                if (!node) {
                    log.error(`Can't set node settings. Node id [${n.cid}/${n.id}] not found.`);
                    return;
                }
                node.settings = n.settings;
                if (node['onSettingsChanged'])
                    node['onSettingsChanged']();
                node.setDirtyCanvas(true, true);
            });
            socket.on('nodes-move-to-new-container', function (data) {
                let container = container_1.Container.containers[data.cid];
                if (!container) {
                    log.error(`Can't move nodes to container. Container id [${data.cid}] not found.`);
                    return;
                }
                container.mooveNodesToNewContainer(data.ids, data.pos);
            });
            socket.on('node-message-to-editor-side', function (n) {
                let container = container_1.Container.containers[n.cid];
                if (!container) {
                    log.error(`Can't send node message. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(n.id);
                if (!node) {
                    log.error(`Can't send node message. Node id [${n.cid}/${n.id}] not found.`);
                    return;
                }
                if (node['onGetMessageToEditorSide'])
                    node['onGetMessageToEditorSide'](n.value);
            });
            socket.on('link-create', function (data) {
                let container = container_1.Container.containers[data.cid];
                if (!container) {
                    log.error(`Can't create link. Container id [${data.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(data.link.origin_id);
                if (!node) {
                    log.error(`Can't create link. Node id [${data.cid}/${data.id}] not found.`);
                    return;
                }
                node.connect(data.link.origin_slot, data.link.target_id, data.link.target_slot);
            });
            socket.on('link-delete', function (data) {
                let container = container_1.Container.containers[data.cid];
                if (!container) {
                    log.error(`Can't delete link. Container id [${data.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(data.link.target_id);
                if (!node) {
                    log.error(`Can't delete link. Node id [${data.cid}/${data.id}] not found.`);
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
                let container = container_1.Container.containers[data.cid];
                if (!container)
                    return;
                for (let id of data.ids) {
                    let node = container.getNodeById(id);
                    if (!node)
                        continue;
                    editor.renderer.showNodeActivity(node);
                }
            });
            socket.on('nodes-io-values', function (slots_values) {
                if (!that.editor.showNodesIOValues)
                    return;
                let container = container_1.Container.containers[slots_values.cid];
                if (!container)
                    return;
                if (slots_values.inputs) {
                    for (let slot of slots_values.inputs) {
                        let node = container.getNodeById(slot.nodeId);
                        if (!node)
                            continue;
                        if (!slot.data)
                            slot.data = "";
                        node.inputs[slot.inputId].label = slot.data;
                        node.setDirtyCanvas(true, true);
                    }
                }
                if (slots_values.outputs) {
                    for (let slot of slots_values.outputs) {
                        let node = container.getNodeById(slot.nodeId);
                        if (!node)
                            continue;
                        if (!slot.data)
                            slot.data = "";
                        node.outputs[slot.outputId].label = slot.data;
                        node.setDirtyCanvas(true, true);
                    }
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
                let gr = JSON.stringify(this.rootContainer.serialize());
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
        getNodes(callback) {
            let root_id = 0;
            $.ajax({
                url: "/api/editor/c/" + root_id,
                success: function (nodes) {
                    let rootContainer = container_1.Container.containers[root_id];
                    rootContainer.configure(nodes, false);
                    if (callback)
                        callback(nodes);
                }
            });
        }
        getContainerState() {
            let that = this;
            $.ajax({
                url: "/api/editor/state",
                success: function (state) {
                    if (state.isRunning)
                        that.editor.onContainerRun();
                    else
                        that.editor.onContainerStop();
                }
            });
        }
        sendCreateNode(type, position) {
            let that = this;
            let json = JSON.stringify({ type: type, position: position, container: that.editor.renderer.container.id });
            $.ajax({
                url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/",
                contentType: 'application/json',
                type: 'POST',
                data: json
            });
        }
        ;
        sendRemoveNode(node) {
            let that = this;
            $.ajax({
                url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/" + node.id,
                type: 'DELETE'
            });
        }
        ;
        sendRemoveNodes(ids) {
            let that = this;
            $.ajax({
                url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/",
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(ids)
            });
        }
        ;
        sendMoveToNewContainer(ids, pos) {
            let that = this;
            $.ajax({
                url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/move/",
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ ids: ids, pos: pos })
            });
        }
        ;
        sendUpdateNodePosition(node) {
            let that = this;
            $.ajax({
                url: `/api/editor/c/${that.editor.renderer.container.id}/n/${node.id}/position`,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify({ position: node.pos })
            });
        }
        ;
        sendUpdateNodeSize(node) {
            let that = this;
            $.ajax({
                url: `/api/editor/c/${that.editor.renderer.container.id}/n/${node.id}/size`,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify({ size: node.size })
            });
        }
        ;
        sendCreateLink(origin_id, origin_slot, target_id, target_slot) {
            let data = {
                origin_id: origin_id,
                origin_slot: origin_slot,
                target_id: target_id,
                target_slot: target_slot,
            };
            let that = this;
            $.ajax({
                url: "/api/editor/c/" + that.editor.renderer.container.id + "/l/",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        }
        ;
        sendRemoveLink(origin_id, origin_slot, target_id, target_slot) {
            let data = {
                origin_id: origin_id,
                origin_slot: origin_slot,
                target_id: target_id,
                target_slot: target_slot,
            };
            let that = this;
            $.ajax({
                url: "/api/editor/c/" + that.editor.renderer.container.id + "/l/",
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        }
        ;
        //---------------------------------------------------
        sendRunContainer() {
            $.ajax({
                url: "/api/editor/run",
                type: 'POST'
            });
        }
        ;
        sendStopContainer() {
            $.ajax({
                url: "/api/editor/stop",
                type: 'POST'
            });
        }
        ;
        sendStepContainer() {
            $.ajax({
                url: "/api/editor/step",
                type: 'POST'
            });
        }
        ;
        //---------------------------------------------------
        sendCloneNode(node) {
            $.ajax({
                url: '/api/editor/nodes/clone',
                type: 'POST',
                data: { 'id': node.id }
            }).done(function () {
            });
        }
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
        sendGetSlotsValues() {
            this.socket.emit("get-nodes-io-values", this.editor.renderer.container.id);
        }
        sendJoinContainerRoom(cont_id) {
            log.debug("Join to editor room [" + cont_id + "]");
            this.socket.emit('room', cont_id);
        }
    }
    exports.EditorClientSocket = EditorClientSocket;
});
//# sourceMappingURL=editor-client-socket.js.map