/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Container } from "../../nodes/container";
import * as io from 'socket.io-client';


const log = require('logplease').create('dashboard-socket', { color: 3 });



export class DashboardClientSocket {

    socket: SocketIOClient.Socket;

    container_id: number;
    reconnecting: boolean;

    constructor(container_id: number) {
        let socket = io('/dashboard');
        this.socket = socket;

        this.container_id = container_id;

        let that = this;

        socket.on('connect', function () {
            log.debug("Connected to socket");
            that.sendJoinContainerRoom(that.container_id);

            if (this.reconnecting) {
                noty({ text: 'Connection is restored.', type: 'alert' });
                //waiting while server initialized and read db
                setTimeout(function () {
                    $("#panelsContainer").empty();
                    $("#panelsContainer").show();
                    that.getContainer();
                }, 2000);
                this.reconnecting = false;
            }
        });


        socket.on('disconnect', () => {
            // $("#panelsContainer").fadeOut(300);
            // noty({ text: 'Connection is lost!', type: 'error' });
            // noty({ text: 'Web server is not responding!', type: 'error' });

            log.debug("Disconnected")
            // this.reconnecting = true;
        });


        socket.on('node-create', function (n) {
            let container = Container.containers[n.cid];
            if (!container) {
                log.error(`Can't create node. Container id [${n.cid}] not found.`);
                return;
            }
            let node = container.createNode(n.type);
            //node.configure(n);
        });



        socket.on('nodes-delete', function (data) {
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

                //if current container removed
                // if (n.id == editor.renderer.container.id) {
                //     (<any>window).location = "/editor/";
                // }
            }
        });

        socket.on('nodeSettings', function (n) {
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
        });

        socket.on('nodes-move-to-new-container', function (data) {
            //todo remove nodes
            // let container = Container.containers[data.cid];
            // container.moveNodesToNewContainer(data.ids, data.pos);
        });

        socket.on('nodeMessageToDashboardSide', function (n) {
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
            if (node['onGetMessageToDashboardSide'])
                node['onGetMessageToDashboardSide'](n.message);
        });

        socket.on('nodes-active', function (data) {
            let container = Container.containers[data.cid];
            if (!container) return;
            for (let id of data.ids) {
                let node = container.getNodeById(id);
                if (!node) continue;

                //todo
                // editor.renderer.showNodeActivity(node);
            }
        });

        socket.on('nodes-clone', function (data) {
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

            }
        });
    }


    sendJoinContainerRoom(cont_id: number) {

        log.debug("Join to dashboard room [" + cont_id + "]");

        this.socket.emit('room', cont_id);
    }


    getContainer(callback?: Function): void {
        let that = this;
        $.ajax({
            url: "/api/dashboard/c/" + that.container_id,
            success: function (c) {
                let cont = Container.containers[that.container_id];
                cont.configure(c, false);
                if (callback)
                    callback(c);

                $('#panelTitle-' + cont.id).html(cont.name);
            }
        });
    }

    getContainerState(): void {
        let that = this;
        $.ajax({
            url: "/api/editor/state",
            success: function (state) {
                // if (state.isRunning)
                // else
            }
        });
    }
}