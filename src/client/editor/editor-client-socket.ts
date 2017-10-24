/**
 * Created by Derwish (derwish.pro@gmail.com) on 02.07.2016.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node, Link, LinkInfo } from "../../nodes/node"
import { Container } from "../../nodes/container";
import { Editor } from "./editor";
import * as io from 'socket.io-client';

const log = require('logplease').create('editor-socket', { color: 3 });

export class EditorClientSocket {


    socket: SocketIOClient.Socket;
    editor: Editor;

    constructor(editor) {
        let SLOTS_VALUES_INTERVAL = 200;

        this.editor = editor;

        let socket = io('/editor');
        this.socket = socket;



        setInterval(() => {
            if (this.socket
                && this.socket.connected
                && this.editor.showNodesIOValues
                && this.editor.isRunning)
                this.sendGetSlotsValues();
        }, SLOTS_VALUES_INTERVAL);


        socket.on('connect', () => {
            log.debug("Connected to socket");

            this.sendJoinContainerRoom(this.editor.renderer.container.id);
            this.editor.updateNodesLabels();
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
        socket.on('disconnect', () => {
            // $("#main").fadeOut(300);
            // noty({ text: 'Web server is not responding!', type: 'error' });

            log.debug("Disconnected")
            // this.socketConnected = false;
        });


        socket.on('node-create', (n) => {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't create node. Container id [${n.cid}] not found.`);
                return;
            }
            let prop = { pos: n.pos };
            if (n.properties)
                prop['properties'] = n.properties;

            let node = container.createNode(n.type, prop);
            this.editor.onNodeCreated(node);
        });


        socket.on('nodes-delete', (data) => {
            let container = Container.containers[data.cid];
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
                this.editor.onNodeRemoved(node);

                //if current container removed
                // if (n.id == editor.renderer.container.id) {
                //     (<any>window).location = "/editor/";
                // }
            }
        });


        socket.on('node-add-input', (n) => {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't update node. Container id [${n.cid}] not found.`);
                return;
            }
            let node = container.getNodeById(n.id);
            if (!node) {
                log.error(`Can't update node. Node id [${n.cid}/${n.id}] not found.`);
                return;
            }
            node.addInput(n.input.name, n.input.type, n.input.extra_info);
            node.setDirtyCanvas(true, true);
        });

        socket.on('node-add-output', (n) => {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't update node. Container id [${n.cid}] not found.`);
                return;
            }
            let node = container.getNodeById(n.id);
            if (!node) {
                log.error(`Can't update node. Node id [${n.cid}/${n.id}] not found.`);
                return;
            }
            node.addOutput(n.output.name, n.output.type, n.output.extra_info);
            node.setDirtyCanvas(true, true);
        });

        socket.on('node-remove-input', (n) => {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't update node. Container id [${n.cid}] not found.`);
                return;
            }
            let node = container.getNodeById(n.id);
            if (!node) {
                log.error(`Can't update node. Node id [${n.cid}/${n.id}] not found.`);
                return;
            }
            node.removeInput(n.input);
            node.setDirtyCanvas(true, true);
        });

        socket.on('node-remove-output', (n) => {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't update node. Container id [${n.cid}] not found.`);
                return;
            }
            let node = container.getNodeById(n.id);
            if (!node) {
                log.error(`Can't update node. Node id [${n.cid}/${n.id}] not found.`);
                return;
            }
            node.removeOutput(n.output);
            node.setDirtyCanvas(true, true);
        });

        socket.on('node-update-position', (n) => {
            let container = Container.containers[n.cid];
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

        socket.on('node-update-size', (n) => {
            let container = Container.containers[n.cid];
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

        socket.on('nodeSettings', (n) => {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't set node settings. Container id [${n.cid}] not found.`);
                return;
            }
            let node = container.getNodeById(n.id);
            if (!node) {
                log.error(`Can't set node settings. Node id [${n.cid}/${n.id}] not found.`);
                return;
            }

            let oldSettings = JSON.parse(JSON.stringify(node.settings));

            if (node['onBeforeSettingsChange'])
                node['onBeforeSettingsChange'](n.settings);

            node.settings = n.settings;

            if (node['onAfterSettingsChange'])
                node['onAfterSettingsChange'](oldSettings);

            node.setDirtyCanvas(true, true);
            this.editor.onNodeSettingsChanged(node);
        });

        socket.on('nodes-move-to-new-container', (data) => {
            let container = Container.containers[data.cid];
            if (!container) {
                log.error(`Can't move nodes to container. Container id [${data.cid}] not found.`);
                return;
            }
            container.moveNodesToNewContainer(data.ids, data.pos);
            this.editor.onNodesMovedToNewContainer(data);

        });

        socket.on('nodeMessageToEditorSide', (n) => {
            let container = Container.containers[n.cid];
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
                node['onGetMessageToEditorSide'](n.message);
        });

        socket.on('nodeMessageToEditorSide', (n) => {
            let container = Container.containers[n.cid];
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
                node['onGetMessageToEditorSide'](n.message);
        });


        socket.on('link-create', (data) => {
            let container = Container.containers[data.cid];
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

        socket.on('link-delete', (data) => {
            let container = Container.containers[data.cid];
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


        socket.on('container-run', (l) => {
            this.editor.onContainerRun();
        });


        socket.on('container-run-step', (l) => {
            this.editor.onContainerRunStep();
        });

        socket.on('container-stop', (l) => {
            this.editor.onContainerStop();
        });


        let activeNodes = [];
        let activedNodes = [];
        socket.on('nodes-active', (data) => {
            // let container = Container.containers[data.cid];
            // if (!container) return;
            for (let id of data.ids) {
                // let node = container.getNodeById(id);
                // if (!node) continue;
                //editor.renderer.showNodeActivity(node);
                activeNodes.push(id);
            }
        });

        //show nodes activity
        let activityState = false;
        setInterval(() => {
            activityState = !activityState;

            if (activityState && activeNodes.length > 0) {
                let container = this.editor.renderer.container;
                for (let id of activeNodes) {
                    let node = container.getNodeById(id);
                    if (!node) continue;
                    // editor.renderer.showNodeActivity(node);
                    node.boxcolor = this.editor.renderer.theme.NODE_ACTIVE_BOXCOLOR;
                    node.setDirtyCanvas(true, true);
                }
                activedNodes = activeNodes;
                activeNodes = [];
            }

            else if (!activityState && activedNodes.length > 0) {
                let container = this.editor.renderer.container;
                for (let id of activedNodes) {
                    let node = container.getNodeById(id);
                    if (!node) continue;
                    node.boxcolor = this.editor.renderer.theme.NODE_DEFAULT_BOXCOLOR;
                    node.setDirtyCanvas(true, true);
                }
                activedNodes = [];
            }
        }, 125);


        socket.on('nodes-io-values', (slots_values) => {
            if (!this.editor.showNodesIOValues)
                return;

            let container = Container.containers[slots_values.cid];
            if (!container) return;

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

        socket.on('nodes-clone', (data) => {
            let container = Container.containers[data.cid];
            if (!container) {
                log.error(`Can't clone node. Container id [${data.cid}] not found.`);
                return;
            }
            for (let id of data.nodes) {
                let node = container.getNodeById(id);
                if (!node) {
                    log.error(`Can't clone node. Node id [${data.cid}/${id}] not found.`);
                    return;
                }

                node.clone();
                this.editor.onNodeCloned(node);
            }
        });

        socket.on('container-import', (data) => {
            let container = Container.containers[data.cid];
            if (!container) {
                log.error(`Can't import container. Container id [${data.cid}] not found.`);
                return;
            }

            container.importContainer(data.ser_node, data.pos);
            this.editor.onConteinerImported(data);

        });


        // socket.on('gateway-connected', function () {
        //     noty({text: 'Gateway connected.', type: 'alert', timeout: false});
        // });
        //
        // socket.on('gateway-disconnected', function () {
        //     noty({text: 'Gateway disconnected!', type: 'error', timeout: false});
        // });


        // this.getGatewayInfo();


        $("#sendButton").click(() => {
            let gr = JSON.stringify(Container.containers[0].serialize());
            $.ajax({
                url: '/api/editor',
                type: 'POST',
                data: { json: gr.toString() }
            }).done(function () {

            });
        }
        );


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


    getNodes(callback?: Function): void {
        let root_id = 0;
        $.ajax({
            url: "/api/editor/c/" + root_id,
            success: function (nodes) {
                let rootContainer = Container.containers[root_id];
                rootContainer.configure(nodes, false);
                if (callback)
                    callback(nodes);
            }
        });
    }

    getContainerState(): void {
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


    sendCreateNode(type: string, position: [number, number]): void {
        let that = this;
        let json = JSON.stringify({ type: type, position: position, container: that.editor.renderer.container.id });
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/",
            contentType: 'application/json',
            type: 'POST',
            data: json
        })
    };


    sendRemoveNode(node: Node): void {
        let that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/" + node.id,
            type: 'DELETE'
        })
    };


    sendRemoveNodes(ids: Array<number>): void {
        let that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/",
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify(ids)
        })
    };

    sendMoveToNewContainer(ids: Array<number>, pos: [number, number]): void {
        let that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/move/",
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ ids: ids, pos: pos })
        })
    };

    sendUpdateNodePosition(node: Node): void {
        let that = this;
        $.ajax({
            url: `/api/editor/c/${that.editor.renderer.container.id}/n/${node.id}/position`,
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify({ position: node.pos })
        })
    };

    sendUpdateNodeSize(node: Node): void {
        let that = this;
        $.ajax({
            url: `/api/editor/c/${that.editor.renderer.container.id}/n/${node.id}/size`,
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify({ size: node.size })
        })
    };


    sendCreateLink(origin_id: number, origin_slot: number, target_id: number, target_slot): void {
        let data: LinkInfo = {
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
    };


    sendRemoveLink(origin_id: number, origin_slot: number, target_id: number, target_slot): void {
        let data: LinkInfo = {
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
        })
    };

    //---------------------------------------------------


    sendRunContainer(): void {
        $.ajax({
            url: "/api/editor/run",
            type: 'POST'
        })
    };

    sendStopContainer(): void {
        $.ajax({
            url: "/api/editor/stop",
            type: 'POST'
        })
    };

    sendStepContainer(): void {
        $.ajax({
            url: "/api/editor/step",
            type: 'POST'
        })
    };


    //---------------------------------------------------


    sendCloneNode(ids: Array<number>): void {
        let that = this;
        $.ajax({
            url: "/api/editor/c/" + that.editor.renderer.container.id + "/n/clone",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(ids)
        })
    };



    sendGetSlotsValues() {
        this.socket.emit("get-nodes-io-values", this.editor.renderer.container.id);
    }

    sendJoinContainerRoom(cont_id: number) {
        log.debug("Join to editor room [" + cont_id + "]");

        this.socket.emit('room', cont_id);
    }
}
