/**
 * Created by derwish on 25.01.17.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'socket.io'], factory);
    }
})(function (require, exports) {
    "use strict";
    const socket = require('socket.io');
    class NodesServerSocket {
        constructor(server) {
            let io = socket(server);
            io.on('connection', function (socket) {
                socket.on('chat message', function (msg) {
                    io.emit('chat message', msg + "2");
                });
            });
        }
    }
    exports.NodesServerSocket = NodesServerSocket;
});
//# sourceMappingURL=node-editor-io.js.map