/**
 * Created by derwish on 25.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'socket.io', "../public/nodes/nodes-engine", "../public/nodes/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    const socket = require('socket.io');
    const nodes_engine_1 = require("../public/nodes/nodes-engine");
    const utils_1 = require("../public/nodes/utils");
    class NodesServerSocket {
        constructor(server) {
            let io = socket(server);
            this.io = io;
            io.on('connection', function (socket) {
                utils_1.default.debug("New socket conection", "SOCKET");
                // socket.on('test message', function (msg) {
                //     io.emit('test message', msg + "2");
                // });
                socket.on('node-message-to-back-side', function (n) {
                    let node = nodes_engine_1.engine.getNodeById(n.id);
                    if (!node) {
                        utils_1.default.debugErr("Cant get node message from front-side. Node id does not exist", this);
                        return;
                    }
                    node.onGetMessageFromFrontSide(n.value);
                });
            });
        }
    }
    exports.NodesServerSocket = NodesServerSocket;
});
//# sourceMappingURL=editor-io.js.map