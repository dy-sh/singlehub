/**
 * Created by Derwish (derwish.pro@gmail.com) on 25.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */



import {Container} from "../../public/nodes/container";
import {app} from "../../app";
import Namespace = SocketIO.Namespace;


const log = require('logplease').create('server', {color: 3});


export class DashboardServerSocket {

    io_root: SocketIO.Server;
    io: Namespace;

    constructor(io_root: SocketIO.Server) {
        this.io_root = io_root;
        let io = this.io_root.of('/dashboard');
        this.io = io;

        io.on('connection', function (socket) {
            log.debug("New socket connection to dashboard");
            // socket.on('test message', function (msg) {
            //     io.emit('test message', msg + "2");
            // });

            //join client to container room
            socket.on('room', function (room) {
                if ((<any>socket).room)
                    socket.leave((<any>socket).room);

                (<any>socket).room = room;
                socket.join(room);
                log.debug("Join to room [" + room + "]");
            });

            socket.on('node-message-to-server-side', function (n) {
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

                node.onGetMessageToServerSide(n.value);
            });


            //redirect message
            socket.on('node-message-to-editor-side', function (n) {
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

                let room = "editor-container-" + n.cid;
                app.server.editorSocket.io.in(room).emit('node-message-to-editor-side', n);

            });

            //redirect message
            socket.on('node-message-to-dashboard-side', function (n) {
                console.log(n)

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

                let room = "dashboard-container-" + n.cid;
                app.server.dashboardSocket.io.in(room).emit('node-message-to-dashboard-side', n);
            });


        });


    }
}
