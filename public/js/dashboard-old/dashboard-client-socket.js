/**
 * Created by Derwish (derwish.pro@gmail.com) on 24.02.2017.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
"use strict";
var log = Logger.create('client', { color: 3 });
var DashboardClientSocket = (function () {
    function DashboardClientSocket() {
        var socket = io();
        this.socket = socket;
        var that = this;
        socket.on('connect', function () {
            log.debug("Connected to socket");
            that.sendJoinContainerRoom(0);
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
            if ($('#node-' + n.id))
                updateNode(n);
            else
                createNode(n);
        });
        socket.on('node-update', function (n) {
            updateNode(n);
        });
        socket.on('panel-update', function (n) {
            updatePanel(n);
        });
        socket.on('node-delete', function (n) {
            removeNode(n);
        });
        socket.on('nodes-delete', function (data) {
            for (var _i = 0, _a = data.nodes; _i < _a.length; _i++) {
                var id = _a[_i];
            }
        });
    }
    DashboardClientSocket.prototype.sendJoinContainerRoom = function (cont_id) {
        var room = "dashboard-container-" + cont_id;
        log.debug("Join to room [" + room + "]");
        this.socket.emit('room', room);
    };
    DashboardClientSocket.prototype.getNodes = function () {
        $.ajax({
            url: "api/dashboard/p/",
            type: "GET",
            success: function (nodes) {
                $("#panelsContainer").empty();
                if (!nodes || nodes.length == 0) {
                    $('#empty-message').show();
                    return;
                }
                for (var i = 0; i < nodes.length; i++) {
                    createNode(nodes[i]);
                }
            }
        });
    };
    return DashboardClientSocket;
}());
exports.DashboardClientSocket = DashboardClientSocket;
