/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import { Container } from "../../public/nodes/container";
import app from "../../app";
import Namespace = SocketIO.Namespace;


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

            socket.on('nodeData', function (data) {
                log.debug("nodeData: " + JSON.stringify(data));
                io.emit("nodeData", data)
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
                console.log(n)
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

                for (let key in n.settings) {
                    let s = n.settings[key];
                    node.settings[key].value = s.value;
                }

                if (node['onSettingsChanged'])
                    node['onSettingsChanged']();

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


            //----------------------- OLD API


            //join client to container room
            socket.on('room', function (room) {
                if ((<any>socket).room != null) {
                    // log.debug("Leave dashboard room [" + (<any>socket).room + "]");
                    socket.leave((<any>socket).room);
                }

                (<any>socket).room = room;
                socket.join(room);
                log.debug("Join to dashboard room [" + room + "]");
            });


        });

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
