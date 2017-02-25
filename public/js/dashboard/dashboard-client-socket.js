(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../nodes/container", "../../nodes/nodes"], factory);
    }
})(function (require, exports) {
    "use strict";
    const container_1 = require("../../nodes/container");
    const nodes_1 = require("../../nodes/nodes");
    let log = Logger.create('client', { color: 3 });
    class DashboardClientSocket {
        constructor() {
            let socket = io();
            this.socket = socket;
            let that = this;
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
                let container = container_1.Container.containers[n.cid];
                let node = nodes_1.Nodes.createNode(n.type);
                node.pos = n.pos;
                node.properties = n.properties;
                //node.configure(n);
                container.create(node);
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
            socket.on('node-message-to-editor-side', function (n) {
                let container = container_1.Container.containers[n.cid];
                let node = container.getNodeById(n.id);
                if (node.onGetMessageToEditorSide)
                    node.onGetMessageToEditorSide(n.value);
            });
            socket.on('nodes-active', function (data) {
                let container = container_1.Container.containers[data.cid];
                for (let id of data.ids) {
                    let node = container.getNodeById(id);
                    if (!node)
                        continue;
                    node.boxcolor = nodes_1.Nodes.options.NODE_ACTIVE_BOXCOLOR;
                    node.setDirtyCanvas(true, true);
                    setTimeout(function () {
                        node.boxcolor = nodes_1.Nodes.options.NODE_DEFAULT_BOXCOLOR;
                        node.setDirtyCanvas(true, true);
                    }, 100);
                }
            });
        }
        sendJoinContainerRoom(cont_id) {
            let room = "dashboard-container-" + cont_id;
            log.debug("Join to room [" + room + "]");
            this.socket.emit('room', room);
        }
        getNodes() {
            $.ajax({
                url: "api/dashboard/p/",
                type: "GET",
                success: function (nodes) {
                    $("#panelsContainer").empty();
                    if (!nodes || nodes.length == 0) {
                        $('#empty-message').show();
                        return;
                    }
                    for (let i = 0; i < nodes.length; i++) {
                    }
                }
            });
        }
    }
    exports.DashboardClientSocket = DashboardClientSocket;
});
//# sourceMappingURL=dashboard-client-socket.js.map