/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var container_1 = require("../../nodes/container");
var log = Logger.create('client', { color: 3 });
var DashboardClientSocket = (function () {
    function DashboardClientSocket(container_id) {
        var socket = io('/dashboard');
        this.socket = socket;
        this.container_id = container_id;
        var that = this;
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
        socket.on('disconnect', function () {
            log.debug("Disconnected from socket");
            $("#panelsContainer").fadeOut(300);
            noty({ text: 'Connection is lost!', type: 'error' });
            that.reconnecting = true;
        });
        socket.on('node-create', function (n) {
            var container = container_1.Container.containers[n.cid];
            if (!container) {
                log.error("Can't create node. Container id [" + n.cid + "] not found.");
                return;
            }
            var node = container.createNode(n.type);
            //node.configure(n);
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
            //todo remove nodes
            // let container = Container.containers[data.cid];
            // container.mooveNodesToNewContainer(data.ids, data.pos);
        });
        socket.on('node-message-to-dashboard-side', function (n) {
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
            if (node['onGetMessageToDashboardSide'])
                node['onGetMessageToDashboardSide'](n.value);
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
            }
        });
    }
    DashboardClientSocket.prototype.sendJoinContainerRoom = function (cont_id) {
        log.debug("Join to dashboard room [" + cont_id + "]");
        this.socket.emit('room', cont_id);
    };
    DashboardClientSocket.prototype.getContainer = function (callback) {
        var that = this;
        $.ajax({
            url: "/api/dashboard/c/" + that.container_id,
            success: function (c) {
                var cont = container_1.Container.containers[that.container_id];
                cont.configure(c, false);
                if (callback)
                    callback(c);
                $('#panelTitle-' + cont.id).html(cont.name);
            }
        });
    };
    DashboardClientSocket.prototype.getContainerState = function () {
        var that = this;
        $.ajax({
            url: "/api/editor/state",
            success: function (state) {
                // if (state.isRunning)
                // else
            }
        });
    };
    return DashboardClientSocket;
}());
exports.DashboardClientSocket = DashboardClientSocket;
