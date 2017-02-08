/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../../nodes/nodes", "../../nodes/nodes-engine", "./node-editor"], factory);
    }
})(function (require, exports) {
    "use strict";
    const nodes_1 = require("../../nodes/nodes");
    const nodes_engine_1 = require("../../nodes/nodes-engine");
    const node_editor_1 = require("./node-editor");
    class EditorSocket {
        constructor() {
            this.engine = nodes_engine_1.engine;
            let socket = io();
            this.socket = socket;
            // socket.emit('chat message', "h1");
            //
            // socket.on('connect', function () {
            //     //todo socket.join(editor.renderer.engine.container_id);
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
                let container = nodes_engine_1.NodesEngine.containers[n.cid];
                let newNode = nodes_1.Nodes.createNode(n.type);
                newNode.pos = n.pos;
                //newNode.configure(n);
                container.add(newNode);
                container.setDirtyCanvas(true, true);
            });
            socket.on('node-delete', function (n) {
                let container = nodes_engine_1.NodesEngine.containers[n.cid];
                let node = container.getNodeById(n.id);
                container.remove(node);
                container.setDirtyCanvas(true, true);
                //if current container removed
                // if (n.id == editor.renderer.engine.container_id) {
                //     (<any>window).location = "/editor/";
                // }
            });
            socket.on('nodes-delete', function (data) {
                let container = nodes_engine_1.NodesEngine.containers[data.cid];
                for (let id of data.nodes) {
                    let node = container.getNodeById(id);
                    container.remove(node);
                }
                container.setDirtyCanvas(true, true);
            });
            socket.on('node-update-position', function (n) {
                let container = nodes_engine_1.NodesEngine.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.pos != n.pos) {
                    node.pos = n.pos;
                    node.setDirtyCanvas(true, true);
                }
            });
            socket.on('node-update-size', function (n) {
                let container = nodes_engine_1.NodesEngine.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.pos != n.pos) {
                    node.size = n.size;
                    node.setDirtyCanvas(true, true);
                }
            });
            socket.on('node-message-to-front-side', function (n) {
                let container = nodes_engine_1.NodesEngine.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.onGetMessageFromBackSide)
                    node.onGetMessageFromBackSide(n.value);
            });
            socket.on('link-create', function (l) {
                let container = nodes_engine_1.NodesEngine.containers[l.cid];
                let node = container.getNodeById(l.link.origin_id);
                let targetNode = container.getNodeById(l.link.target_id);
                // node.disconnectOutput(l.origin_slot, targetNode);
                // targetNode.disconnectInput(l.target_slot);
                node.connect(l.link.origin_slot, targetNode, l.link.target_slot);
                container.change();
            });
            socket.on('link-delete', function (l) {
                let container = nodes_engine_1.NodesEngine.containers[l.cid];
                let link = container.links[l.id];
                let node = container.getNodeById(link.origin_id);
                let targetNode = container.getNodeById(link.target_id);
                node.disconnectOutput(link.origin_slot, targetNode);
                //targetNode.disconnectInput(link.target_slot);
            });
            socket.on('nodes-active', function (data) {
                let container = nodes_engine_1.NodesEngine.containers[data.cid];
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
            // socket.on('gateway-connected', function () {
            //     noty({text: 'Gateway connected.', type: 'alert', timeout: false});
            // });
            //
            // socket.on('gateway-disconnected', function () {
            //     noty({text: 'Gateway disconnected!', type: 'error', timeout: false});
            // });
            // this.getGatewayInfo();
            $("#sendButton").click(function () {
                //console.log(engine);
                let gr = JSON.stringify(this.engine.serialize());
                $.ajax({
                    url: '/api/editor/graph',
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
                url: "/api/editor/c/" + node_editor_1.editor.renderer.engine.container_id,
                success: function (nodes) {
                    nodes_engine_1.engine.configure(nodes, false);
                }
            });
        }
        sendCreateNode(type, position) {
            let json = JSON.stringify({ type: type, position: position, container: node_editor_1.editor.renderer.engine.container_id });
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.engine.container_id + "/n/",
                contentType: 'application/json',
                type: 'POST',
                data: json
            });
        }
        ;
        sendRemoveNode(node) {
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.engine.container_id + "/n/" + node.id,
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
                url: "/api/editor/c/" + node_editor_1.editor.renderer.engine.container_id + "/n/",
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(ids)
            });
        }
        ;
        sendUpdateNodePosition(node) {
            $.ajax({
                url: `/api/editor/c/${node_editor_1.editor.renderer.engine.container_id}/n/${node.id}/position`,
                contentType: 'application/json',
                type: 'PUT',
                data: JSON.stringify({ position: node.pos })
            });
        }
        ;
        sendUpdateNodeSize(node) {
            $.ajax({
                url: `/api/editor/c/${node_editor_1.editor.renderer.engine.container_id}/n/${node.id}/size`,
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
                url: "/api/editor/c/" + node_editor_1.editor.renderer.engine.container_id + "/l/",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        }
        ;
        sendRemoveLink(link) {
            $.ajax({
                url: "/api/editor/c/" + node_editor_1.editor.renderer.engine.container_id + "/l/" + link.id,
                type: 'DELETE'
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
    }
    exports.EditorSocket = EditorSocket;
    exports.socket = new EditorSocket();
});
//# sourceMappingURL=editor-socket.js.map