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
            // socket.emit('chat message', "h1");
            // socket.on('node position update', function (n) {
            //     console.log("node position update " + JSON.stringify(n))
            //     let node = engine.getNodeById(n.id);
            //     if (node.pos != n.pos) {
            //         node.pos = n.pos;
            //         node.setDirtyCanvas(true, true);
            //     }
            // });
            //
            // socket.on('connect', function () {
            //     //todo socket.join(engine.container_id);
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
            socket.on('gatewayConnected', function () {
                noty({ text: 'Gateway connected.', type: 'alert', timeout: false });
            });
            socket.on('gatewayDisconnected', function () {
                noty({ text: 'Gateway disconnected!', type: 'error', timeout: false });
            });
            socket.on('removeAllNodesAndLinks', function () {
                this.engine.clear();
                window.location.replace("/editor/");
                noty({ text: 'All nodes have been deleted!', type: 'error' });
            });
            socket.on('nodeActivity', function (nodeId) {
                let node = this.engine.getNodeById(nodeId);
                if (node == null)
                    return;
                node.boxcolor = nodes_1.Nodes.options.NODE_ACTIVE_BOXCOLOR;
                node.setDirtyCanvas(true, true);
                setTimeout(function () {
                    node.boxcolor = nodes_1.Nodes.options.NODE_DEFAULT_BOXCOLOR;
                    node.setDirtyCanvas(true, true);
                }, 100);
            });
            socket.on('removeNode', function (nodeId) {
                //if current container removed
                if (nodeId == nodes_engine_1.engine.container_id) {
                    window.location = "/editor/";
                }
                let node = this.engine.getNodeById(nodeId);
                if (node == null)
                    return;
                this.engine.remove(node);
                this.engine.setDirtyCanvas(true, true);
            });
            socket.on('nodeUpdated', function (node) {
                if (node.container_id != nodes_engine_1.engine.container_id)
                    return;
                this.createOrUpdateNode(node);
            });
            socket.on('newNode', function (node) {
                if (node.container_id != nodes_engine_1.engine.container_id)
                    return;
                this.createOrUpdateNode(node);
            });
            socket.on('removeLink', function (link) {
                if (link.container_id != nodes_engine_1.engine.container_id)
                    return;
                //let node = this.engine.getNodeById(link.origin_id);
                let targetNode = this.engine.getNodeById(link.target_id);
                //node.disconnectOutput(link.target_slot, targetNode);
                targetNode.disconnectInput(link.target_slot);
            });
            socket.on('newLink', function (link) {
                if (link.container_id != nodes_engine_1.engine.container_id)
                    return;
                let node = this.engine.getNodeById(link.origin_id);
                let targetNode = this.engine.getNodeById(link.target_id);
                node.connect(link.origin_slot, targetNode, link.target_slot, link.id);
                //  this.engine.change();
            });
            this.getNodes();
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
        /**
         * Get nodes for container
         */
        getNodes() {
            let that = this;
            $.ajax({
                url: "/api/editor/containers/" + nodes_engine_1.engine.container_id,
                success: function (nodes) {
                    nodes_engine_1.engine.configure(nodes, false);
                }
            });
        }
        /**
         * Send create new node
         * @param type
         * @param position
         */
        sendCreateNode(type, position) {
            $.ajax({
                url: '/api/editor/nodes',
                type: 'POST',
                data: { type: type, position: position, container: nodes_engine_1.engine.container_id }
            });
        }
        ;
        //---------------------------------------------------
        sendCreateLink(link) {
            $.ajax({
                url: '/api/editor/links',
                type: 'POST',
                data: { 'link': link }
            });
        }
        ;
        sendRemoveLink(link) {
            $.ajax({
                url: '/api/editor/links',
                type: 'DELETE',
                data: { 'link': link }
            }).done(function () {
            });
        }
        ;
        sendCloneNode(node) {
            $.ajax({
                url: '/api/editor/nodes/clone',
                type: 'POST',
                data: { 'id': node.id }
            }).done(function () {
            });
        }
        ;
        sendRemoveNode(node) {
            let serializedNode = node.serialize();
            $.ajax({
                url: '/api/editor/nodes',
                type: 'DELETE',
                data: { 'node': serializedNode }
            }).done(function () {
            });
        }
        ;
        sendRemoveNodes(nodes) {
            let array = [];
            for (let n in nodes) {
                array.push(nodes[n].id);
            }
            $.ajax({
                url: '/api/editor/nodes',
                type: 'DELETE',
                data: { 'nodes': array }
            }).done(function () {
            });
        }
        ;
        sendUpdateNode(node) {
            let s = node.serialize();
            s = JSON.stringify(s);
            $.ajax({
                url: '/api/editor/nodes',
                type: 'PUT',
                data: { 'node': s }
            }).done(function () {
            });
        }
        ;
        getGraph() {
            $.ajax({
                url: "/api/editor/graph",
                success: function (graph) {
                    this.engine.configure(graph);
                }
            });
        }
        onReturnNodes(nodes) {
            if (!nodes)
                return;
            console.log(nodes);
            for (let i = 0; i < nodes.length; i++) {
                this.createOrUpdateNode(nodes[i]);
            }
            this.getLinks();
        }
        createOrUpdateNode(node) {
            let oldNode = this.engine.getNodeById(node.id);
            if (!oldNode) {
                //create new
                let newNode = nodes_1.Nodes.createNode(node.type);
                if (newNode == null) {
                    console.error("Can`t create node of type: [" + node.type + "]");
                    return;
                }
                newNode.title = node.title;
                newNode.inputs = node.inputs;
                newNode.outputs = node.outputs;
                newNode.id = node.id;
                newNode.properties = node.properties;
                //calculate size
                if (node.size)
                    newNode.size = node.size;
                else
                    newNode.size = newNode.computeSize();
                newNode.size[1] = this.calculateNodeMinHeight(newNode);
                //calculate pos
                if (node.pos)
                    newNode.pos = node.pos;
                else
                    newNode.pos = [nodes_1.Nodes.options.START_POS, this.findFreeSpaceY(newNode)];
                this.engine.add(newNode);
            }
            else {
                //update
                oldNode.title = node.title;
                if (node.properties['name'] != null)
                    oldNode.title += " [" + node.properties['name'] + "]";
                if (node.properties['container-name'] != null)
                    oldNode.title = node.properties['container-name'];
                oldNode.inputs = node.inputs;
                oldNode.outputs = node.outputs;
                oldNode.id = node.id;
                oldNode.properties = node.properties;
                //calculate size
                if (node.size)
                    oldNode.size = node.size;
                else
                    oldNode.size = oldNode.computeSize();
                oldNode.size[1] = this.calculateNodeMinHeight(oldNode);
                //calculate pos
                if (node.pos) {
                    if (!node_editor_1.editor.renderer.node_dragged)
                        oldNode.pos = node.pos;
                    else if (!node_editor_1.editor.renderer.selected_nodes[node.id])
                        oldNode.pos = node.pos;
                }
                oldNode.setDirtyCanvas(true, true);
            }
        }
        getLinks() {
            $.ajax({
                url: "/api/editor/links/" + nodes_engine_1.engine.container_id,
                success: function (links) {
                    this.onReturnLinks(links);
                }
            });
        }
        onReturnLinks(links) {
            //console.log(nodes);
            if (!links)
                return;
            for (let i = 0; i < links.length; i++) {
                this.createOrUpdateLink(links[i]);
            }
        }
        createOrUpdateLink(link) {
            let target = this.engine.getNodeById(link.target_id);
            this.engine.getNodeById(link.origin_id)
                .connect(link.origin_slot, target, link.target_slot);
            // .connect(link.origin_slot, target, link.target_slot, link.id);
        }
        calculateNodeMinHeight(node) {
            let slotsMax = (node.outputs.length > node.inputs.length) ? node.outputs.length : node.inputs.length;
            if (slotsMax == 0)
                slotsMax = 1;
            let height = nodes_1.Nodes.options.NODE_SLOT_HEIGHT * slotsMax;
            return height + 5;
        }
        findFreeSpaceY(node) {
            let nodes = this.engine._nodes;
            node.pos = [0, 0];
            let result = nodes_1.Nodes.options.START_POS;
            for (let i = 0; i < nodes.length; i++) {
                let needFromY = result;
                let needToY = result + node.size[1];
                if (node.id == nodes[i].id)
                    continue;
                if (!nodes[i].pos)
                    continue;
                if (nodes[i].pos[0] > nodes_1.Nodes.options.NODE_WIDTH + 20 + nodes_1.Nodes.options.START_POS)
                    continue;
                let occupyFromY = nodes[i].pos[1] - nodes_1.Nodes.options.FREE_SPACE_UNDER;
                let occupyToY = nodes[i].pos[1] + nodes[i].size[1];
                if (occupyFromY <= needToY && occupyToY >= needFromY) {
                    result = occupyToY + nodes_1.Nodes.options.FREE_SPACE_UNDER;
                    i = -1;
                }
            }
            return result;
        }
    }
    exports.EditorSocket = EditorSocket;
    exports.socket = new EditorSocket();
});
//# sourceMappingURL=editor-socket.js.map