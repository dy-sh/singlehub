/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
module.exports = (function () {
    var app = require('./server');
    var debug = require('debug')('server:           ');
    var debugError = require('debug')('server:error      ');
    var http = require('http');
    var config = require('../../config');
    var port = normalizePort(process.env.PORT || config.webServer.port || '1312');
    app.set('port', port);
    var server = http.createServer(app);
    // mysensors gateway socket.io
    var io = require('../mysensors/gateway-io').listen(server);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    /**
     * Normalize a port into a number, string, or false.
     */
    function normalizePort(val) {
        var port = parseInt(val, 10);
        if (isNaN(port)) {
            // named pipe
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }
        return false;
    }
    /**
     * Event listener for HTTP server "error" event.
     */
    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                debugError(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                debugError(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
    /**
     * Event listener for HTTP server "listening" event.
     */
    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
        //console.log("Server started on " + bind);
    }
})();
//# sourceMappingURL=configure.js.map