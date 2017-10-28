/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Container } from "../nodes/container";
import app from "../app";
import Namespace = SocketIO.Namespace;
import { UiNode } from "../nodes/nodes/ui/ui-node";


const log = require('logplease').create('server', { color: 3 });


export class DashboardServerSocket {

    io_root: SocketIO.Server;
    io: Namespace;

    constructor(io_root: SocketIO.Server) {
        this.io_root = io_root;
        let io = this.io_root.of('/dashboard');
        this.io = io;

        io.on('connection', function (socket) {
            log.debug("New client connected to dashboard");
            // socket.on('test message', function (msg) {
            //     io.emit('test message', msg + "2");
            // });

            //----------------------- NEW API

            //test event
            // socket.emit("customEmit", "hello")

            socket.on('disconnect', () => {
                log.debug('Client disconnected from dashboard');
            });

            socket.on('getUiPanel', (name) => {
                log.debug("getUiPanel: " + name);
                socket.emit("getUiPanel", app.dashboard.getUiPanel(name))
            });

            socket.on('getUiPanels', () => {
                log.debug("getUiPanels");
                socket.emit("getPanels", app.dashboard.getUiPanels())
            });

            socket.on('getUiPanelsList', () => {
                log.debug("getUiPanelsList");
                socket.emit("getUiPanelsList", app.dashboard.getUiPanelsList())
            });




            socket.on('nodeMessageToServerSide', (n) => {
                // console.log("nodeMessageToServerSide", n);

                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to server-side. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to server-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                if (!node['onGetMessageToServerSide']) {
                    log.error("Can't send node message to server-side. Node " + node.getReadableId() + "dont have onGetMessageToServerSide method!");
                    return;
                }

                node['onGetMessageToServerSide'](n.message);
            });



            //redirect message
            socket.on('nodeMessageToEditorSide', (n) => {
                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to editor-side. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to editor-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                app.server.editorSocket.io.in(n.cid).emit('nodeMessageToEditorSide', n);

            });

            //redirect message
            socket.on('nodeMessageToDashboardSide', (n) => {
                // console.log("nodeMessageToDashboardSide",n)

                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't send node message to dashboard-side. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't send node message to dashboard-side. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                app.server.dashboardSocket.io.in(n.cid).emit('nodeMessageToDashboardSide', n);
            });


            socket.on('nodeSettings', (n) => {
                // console.log(n)
                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't update node settings. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't update node settings. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                let oldSettings = JSON.parse(JSON.stringify(node.settings));

                if (node['onBeforeSettingsChange'])
                    node['onBeforeSettingsChange'](n.settings);

                for (let key in n.settings) {
                    let s = n.settings[key];
                    node.settings[key].value = s.value;
                }

                if (node['onAfterSettingsChange'])
                    node['onAfterSettingsChange'](oldSettings);


                if (app.db)
                    app.db.updateNode(node.id, node.container.id, { $set: { settings: node.settings } });

                app.server.editorSocket.io.emit('nodeSettings', {
                    id: n.id,
                    cid: n.cid,
                    settings: node.settings
                });

                if (node.isDashboardNode)
                    app.server.dashboardSocket.io.in(n.cid).emit('nodeSettings', {
                        id: n.id,
                        cid: n.cid,
                        settings: node.settings
                    });
            });


            socket.on('dashboardElementGetNodeState', (n) => {
                // console.log("nodeMessageToServerSide", n);

                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't get dashboard element state. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't get dashboard element state. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                //you can override get state logic 
                if (node['onDashboardElementGetNodeState']) {
                    node['onDashboardElementGetNodeState'](n.options);
                } else {
                    let m = { id: node.id, cid: node.container.id, state: node.properties["state"] };
                    socket.emit("dashboardElementGetNodeState", m)
                }
            });


            socket.on('dashboardElementSetNodeState', (n) => {
                // console.log("nodeMessageToServerSide", n);

                let cont = Container.containers[n.cid];
                if (!cont) {
                    log.error("Can't set node state from dashboard element. Container id [" + n.cid + "] does not exist");
                    return;
                }

                let node = cont.getNodeById(n.id);
                if (!node) {
                    log.error("Can't set node state from dashboard element. Node id [" + n.cid + "/" + n.id + "] does not exist");
                    return;
                }

                //you can override get state logic 
                if (node['onDashboardElementSetNodeState']) {
                    node['onDashboardElementSetNodeState'](n.state);
                } else {
                    node.properties["state"] = n.state;
                    //send state back to all clients
                    let m = { id: node.id, cid: node.container.id, state: node.properties["state"] };
                    let panelName = this.settings["ui-panel"].value;
                    io.in("" + panelName).emit("dashboardElementGetNodeState", m);
                }
            });



            //join client to dashboard room
            socket.on('room', (room) => {
                if ((<any>socket).room != null) {
                    log.debug("Leave dashboard room [" + (<any>socket).room + "]");
                    socket.leave((<any>socket).room);
                }

                (<any>socket).room = room;
                socket.join(room);
                log.debug("Join to dashboard room [" + room + "]");
            });
        });

        //todo
        // app.on('started', function () {
        //     let rootContainer = Container.containers[0];
        //     rootContainer.on('remove', function (node) {
        //         if (node.isDashboardNode) {
        //             app.server.dashboardSocket.io.in(node.cid).emit('node-delete', {
        //                 id: node.id,
        //                 cid: node.cid,
        //             });
        //             console.log(node.id);
        //         }
        //     })
        // });

    }
}
