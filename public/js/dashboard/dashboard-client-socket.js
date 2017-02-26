/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
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
    class DashboardClientSocket {
        constructor(container_id) {
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
                if (!container) {
                    log.error(`Can't create node. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.createNode(n.type);
                //node.configure(n);
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
                if (!container) {
                    log.error(`Can't send node message. Container id [${n.cid}] not found.`);
                    return;
                }
                let node = container.getNodeById(n.id);
                if (!node) {
                    log.error(`Can't send node message. Node id [${n.cid}/${n.id}] not found.`);
                    return;
                }
                if (node.onGetMessageToDashboardSide)
                    node.onGetMessageToDashboardSide(n.value);
            });
            socket.on('nodes-active', function (data) {
                let container = container_1.Container.containers[data.cid];
                if (!container)
                    return;
                for (let id of data.ids) {
                    let node = container.getNodeById(id);
                    if (!node)
                        continue;
                }
            });
        }
        sendJoinContainerRoom(cont_id) {
            log.debug("Join to dashboard room [" + cont_id + "]");
            this.socket.emit('room', cont_id);
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