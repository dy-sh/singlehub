/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes", "../../nodes/container", "./node-editor"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const container_1 = require("../../nodes/container");
    const node_editor_1 = require("./node-editor");
    class EditorSocket {
        constructor() {
            let SLOTS_VALUES_INTERVAL = 200;
            this.container = container_1.rootContainer;
            let socket = io();
            this.socket = socket;
            let that = this;
            setInterval(function () {
                if (that.socket
                    && that.socket.connected
                    && node_editor_1.editor.showSlotsValues
                    && node_editor_1.editor.isRunning)
                    that.sendGetSlotsValues();
            }, SLOTS_VALUES_INTERVAL);
            // socket.emit('chat message', "h1");
            //
            // socket.on('connect', function () {
            //     //todo socket.join(editor.renderer.container.id);
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
                let newNode = nodes_1.Nodes.createNode(n.type);
                newNode.pos = n.pos;
                newNode.properties = n.properties;
                //newNode.configure(n);
                container.add(newNode);
                if (newNode.onCreated)
                    newNode.onCreated();
                container.setDirtyCanvas(true, true);
            });
            socket.on('node-delete', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                container.remove(node);
                container.setDirtyCanvas(true, true);
                //if current container removed
                // if (n.id == editor.renderer.container.id) {
                //     (<any>window).location = "/editor/";
                // }
            });
            socket.on('nodes-delete', function (data) {
                let container = container_1.Container.containers[data.cid];
                for (let id of data.nodes) {
                    let node = container.getNodeById(id);
                    container.remove(node);
                }
                container.setDirtyCanvas(true, true);
            });
            socket.on('node-update-position', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.pos != n.pos) {
                    node.pos = n.pos;
                    node.setDirtyCanvas(true, true);
                }
            });
            socket.on('node-update-size', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.pos != n.pos) {
                    node.size = n.size;
                    node.setDirtyCanvas(true, true);
                }
            });
            socket.on('node-message-to-front-side', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.onGetMessageFromBackSide)
                    node.onGetMessageFromBackSide(n.value);
            });
            socket.on('link-create', function (l) {
                let container = container_1.Container.containers[l.cid];
                let node = container.getNodeById(l.link.origin_id);
                let targetNode = container.getNodeById(l.link.target_id);
                // node.disconnectOutput(l.origin_slot, targetNode);
                // targetNode.disconnectInput(l.target_slot);
                node.connect(l.link.origin_slot, targetNode, l.link.target_slot);
                container.change();
            });
            socket.on('link-delete', function (l) {
                let container = container_1.Container.containers[l.cid];
                let link = container.links[l.id];
                let node = container.getNodeById(link.origin_id);
                let targetNode = container.getNodeById(link.target_id);
                node.disconnectOutput(link.origin_slot, targetNode);
                //targetNode.disconnectInput(link.target_slot);
            });
            socket.on('container-run', function (l) {
                node_editor_1.editor.onContainerRun();
            });
            socket.on('container-run-step', function (l) {
                node_editor_1.editor.onContainerRunStep();
            });
            socket.on('container-stop', function (l) {
                node_editor_1.editor.onContainerStop();
            });
            socket.on('nodes-active', function (data) {
                let container = container_1.Container.containers[data.cid];
                for (let id of data.ids) {
                    let node = container.getNodeById(id);
                    if (node == null)
                        return;
                    node.boxcolor = nodes_1.Nodes.options.NODE_ACTIVE_BOXCOLOR;
                    node.setDirtyCanvas(true, true);
                    setTimeout(function () {
                        node.boxcolor = nodes_1.Nodes.options.NODE_DEFAULT_BOXCOLOR;
                        node.setDirtyCanvas(true, true);
                    }, 100);
                }
            });
            socket.on('slots-values', function (slots_values) {
                let container = container_1.Container.containers[slots_values.cid];
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
                //console.log(container);
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
        getNodes() {
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.container.id,
                success: function (nodes) {
                    container_1.rootContainer.configure(nodes, false);
                }
            });
        }
        getContainerState() {
            $.ajax({
                url: "/api/editor/state",
                success: function (state) {
                    if (state.isRunning)
                        node_editor_1.editor.onContainerRun();
                    else
                        node_editor_1.editor.onContainerStop();
                }
            });
        }
        sendCreateNode(type, position) {
            let json = JSON.stringify({ type: type, position: position, container: node_editor_1.editor.renderer.container.id });
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.container.id + "/n/",
                contentType: 'application/json',
                type: 'POST',
                data: json
            });
        }
        ;
        sendRemoveNode(node) {
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.container.id + "/n/" + node.id,
                type: 'DELETE'
            });
        }
        ;
        sendRemoveNodes(nodes) {
            let ids = [];
            for (let n in nodes) {
                ids.push(n);
            }
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.container.id + "/n/",
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(ids)
            });
        }
        ;
        sendUpdateNodePosition(node) {
            $.ajax({
                url: `/api/editor/c/${node_editor_1.editor.renderer.container.id}/n/${node.id}/position`,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify({ position: node.pos })
            });
        }
        ;
        sendUpdateNodeSize(node) {
            $.ajax({
                url: `/api/editor/c/${node_editor_1.editor.renderer.container.id}/n/${node.id}/size`,
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
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.container.id + "/l/",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        }
        ;
        sendRemoveLink(link) {
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.container.id + "/l/" + link.id,
                type: 'DELETE'
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
            this.socket.emit("get-slots-values", node_editor_1.editor.container.id);
        }
    }
    exports.EditorSocket = EditorSocket;
    exports.socket = new EditorSocket();
});
//# sourceMappingURL=editor-socket.js.map