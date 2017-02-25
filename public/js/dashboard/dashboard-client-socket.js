/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../nodes/container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../nodes/container");
    let log = Logger.create('client', { color: 3 });
    class DashboardClientSocket {
        constructor(container_id) {
            let socket = io();
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
                        that.getNodes();
                    }, 2000);
                    this.reconnecting = false;
                }
            });
            socket.on('disconnect', function () {
                log.debug("Disconnected from socket");
                $("#panelsContainer").fadeOut(300);
                noty({ text: 'Connection is lost!', type: 'error' });
                that.reconnecting = true;
            });
            socket.on('node-create', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.createNode(n.type);
                //node.configure(n);
            });
            socket.on('node-delete', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                container.remove(node);
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
            });
            socket.on('node-settings', function (n) {
                let container = container_1.Container.containers[n.cid];
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
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.onGetMessageToDashboardSide)
                    node.onGetMessageToDashboardSide(n.value);
            });
            socket.on('nodes-active', function (data) {
                let container = container_1.Container.containers[data.cid];
                for (let id of data.ids) {
                    let node = container.getNodeById(id);
                    if (!node)
                        continue;
                }
            });
        }
        sendJoinContainerRoom(cont_id) {
            let room = "dashboard-container-" + cont_id;
            log.debug("Join to room [" + room + "]");
            this.socket.emit('room', room);
        }
        getNodes(callback) {
            let that = this;
            $.ajax({
                url: "/api/dashboard/c/" + that.container_id,
                success: function (nodes) {
                    let cont = container_1.Container.containers[that.container_id];
                    cont.configure(nodes, false);
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
                    // if (state.isRunning)
                    // else
                }
            });
        }
    }
    exports.DashboardClientSocket = DashboardClientSocket;
});
//# sourceMappingURL=dashboard-client-socket.js.map