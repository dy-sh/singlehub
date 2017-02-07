/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'express', 'path', 'morgan', 'cookie-parser', 'body-parser', 'http', 'debug', 'chalk', "../../routes/editor-io"], factory);
    }
})(function (require, exports) {
    "use strict";
    const express = require('express');
    const path = require('path');
    const logger = require('morgan');
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const http = require('http');
    const debug = require('debug');
    const chalk = require('chalk');
    const log = console.log;
    const error = function (txt) {
        console.log(chalk.bold.red(txt));
    };
    const editor_io_1 = require("../../routes/editor-io");
    let config = require('./../../config.json');
    class Server {
        constructor() {
            this.__rootdirname = global.__rootdirname;
            this.express = express();
            this.setViewEngine();
            this.middleware();
            this.routes();
            this.handeErrors();
            this.configure();
            this.start_io();
        }
        setViewEngine() {
            this.express.set('views', path.join(this.__rootdirname, 'views'));
            this.express.set('view engine', 'jade');
        }
        middleware() {
            // uncomment after placing your favicon in /public
            //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
            if (config.webServer.debug)
                this.express.use(logger('dev'));
            this.express.use(bodyParser.json());
            this.express.use(bodyParser.urlencoded({ extended: false }));
            this.express.use(cookieParser());
            this.express.use(require('stylus').middleware(path.join(this.__rootdirname, 'public')));
            this.express.use(express.static(path.join(this.__rootdirname, 'public')));
        }
        routes() {
            //api console logger
            this.express.use('/api/', function (req, res, next) {
                var send = res.send;
                res.send = function (body) {
                    if (res.statusCode == 200)
                        log(body);
                    else
                        error(body);
                    send.call(this, body);
                };
                next();
            });
            this.express.use('/', require('./../../routes/first-run'));
            this.express.use('/', require('./../../routes/index'));
            this.express.use('/dashboard', require('./../../routes/dashboard'));
            this.express.use('/editor', require('./../../routes/editor'));
            this.express.use('/api/editor', require('./../../routes/api-editor'));
            this.express.use('/mysensors', require('./../../routes/mysensors'));
            this.express.use('/api/mysensors', require('./../../routes/api-mysensors'));
        }
        handeErrors() {
            // // catch 404 and forward to error handler
            // this.express.use(function (req, res, next) {
            //     let err = new Error('Not Found');
            //     (<any>err).status = 404;
            //     next(err);
            // });
            // error handlers
            // development error handler: will print stacktrace
            if (this.express.get('env') === 'development') {
                this.express.use((err, req, res, next) => {
                    console.log(err);
                    res.status(err.status || 500);
                    res.render('error', { message: err.message, error: err });
                });
            }
            // production error handler: no stacktraces leaked to user
            this.express.use((err, req, res, next) => {
                console.log(err);
                res.status(err.status || 500);
                res.render('error', { message: err.message, error: {} });
            });
        }
        configure() {
            debug('ts-express:server');
            const port = normalizePort(process.env.PORT || 1312);
            this.express.set('port', port);
            this.server = http.createServer(this.express);
            this.server.listen(port);
            this.server.on('error', onError);
            this.server.on('listening', onListening);
            // let io=socket(this.server);
            //
            //
            //
            // io.on('connection', function(socket){
            //     socket.on('chat message', function(msg){
            //         io.emit('chat message', msg+"2");
            //     });
            // });
            function normalizePort(val) {
                let port = (typeof (val) === 'string') ? parseInt(val, 10) : val;
                if (isNaN(port))
                    return val;
                else if (port >= 0)
                    return port;
                else
                    return false;
            }
            var that = this;
            function onError(error) {
                if (error.syscall !== 'listen')
                    throw error;
                let bind = (typeof (port) === 'string') ? 'Pipe ' + port : 'Port ' + port;
                switch (error.code) {
                    case 'EACCES':
                        console.error(`${bind} requires elevated privileges`);
                        process.exit(1);
                        break;
                    case 'EADDRINUSE':
                        console.error(`${bind} is already in use`);
                        process.exit(1);
                        break;
                    default:
                        throw error;
                }
            }
            function onListening() {
                let addr = that.server.address();
                let bind = (typeof (addr) === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
                debug(`Listening on ${bind}`);
            }
        }
        start_io() {
            this.socket = new editor_io_1.NodesServerSocket(this.server);
        }
    }
    exports.server = new Server();
});
//# sourceMappingURL=server.js.map