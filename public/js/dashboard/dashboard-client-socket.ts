/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import {Container} from "../../nodes/container";
import {dashboard} from "./dashboard";
import {editor} from "../editor/editor";



//console logger
declare let Logger: any; // tell the ts compiler global variable is defined
let log = Logger.create('client', {color: 3});

export class DashboardClientSocket {

    socket: SocketIOClient.Socket;

    container_id:number;
    reconnecting: boolean;

    constructor(container_id: number) {
        let socket = io('/dashboard');
        this.socket = socket;

        this.container_id=container_id;

        let that = this;

        socket.on('connect', function () {
            log.debug("Connected to socket");
            that.sendJoinContainerRoom(that.container_id);

            if (this.reconnecting) {
                noty({text: 'Connection is restored.', type: 'alert'});
                //waiting while server initialized and read db
                setTimeout(function () {
                    $("#panelsContainer").empty();
                    $("#panelsContainer").show();
                    that.getNodes();
                }, 2000);
                this.reconnecting = false;
            }
        });

        socket.on('disconnect', function () {
            log.debug("Disconnected from socket");
            $("#panelsContainer").fadeOut(300);
            noty({text: 'Connection is lost!', type: 'error'});
            that.reconnecting = true;
        });


        socket.on('node-create', function (n) {
            let container = Container.containers[n.cid];
            let node = container.createNode(n.type);
            //node.configure(n);
        });

        socket.on('node-delete', function (n) {
            let container = Container.containers[n.cid];
            let node = container.getNodeById(n.id);
            container.remove(node);

            //if current container removed
            // if (n.id == editor.renderer.container.id) {
            //     (<any>window).location = "/editor/";
            // }
        });

        socket.on('nodes-delete', function (data) {
            let container = Container.containers[data.cid];
            for (let id of data.nodes) {
                let node = container.getNodeById(id);
                container.remove(node);
            }
        });

        socket.on('node-settings', function (n) {
            let container = Container.containers[n.cid];
            let node = container.getNodeById(n.id);
            node.settings = n.settings;
            if (node.onSettingsChanged)
                node.onSettingsChanged();
            node.setDirtyCanvas(true, true);
        });

        socket.on('nodes-move-to-new-container', function (data) {
            //todo remove nodes
            // let container = Container.containers[data.cid];
            // container.mooveNodesToNewContainer(data.ids, data.pos);
        });

        socket.on('node-message-to-dashboard-side', function (n) {
            let container = Container.containers[n.cid];
            let node = container.getNodeById(n.id);
            if (node.onGetMessageToDashboardSide)
                node.onGetMessageToDashboardSide(n.value);
        });

        socket.on('nodes-active', function (data) {
            let container = Container.containers[data.cid];
            for (let id of data.ids) {
                let node = container.getNodeById(id);
                if (!node)
                    continue;

                //todo
                // editor.renderer.showNodeActivity(node);
            }
        });
    }


    sendJoinContainerRoom(cont_id: number) {
        let room = "dashboard-container-" + cont_id;

        log.debug("Join to room [" + room + "]");

        this.socket.emit('room', room);
    }


    getNodes(callback?: Function): void {
        let that=this;
        $.ajax({
            url: "/api/dashboard/c/" +that.container_id,
            success: function (nodes) {
                let cont = Container.containers[that.container_id];
                cont.configure(nodes, false);
                if (callback)
                    callback(nodes);
            }
        });
    }

    getContainerState(): void {
        let that=this;
        $.ajax({
            url: "/api/editor/state",
            success: function (state) {
                // if (state.isRunning)
                // else
            }
        });
    }
}