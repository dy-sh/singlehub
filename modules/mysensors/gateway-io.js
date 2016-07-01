/**
 * Created by Derwish on 01.07.2016.
 */

var socketio = require('socket.io');

module.exports.listen = function (app) {
	io = socketio.listen(app);

	users = io.of('/mysensors');
	users.on('connection', function (socket) {
		socket.emit('OnConnected', {hello: 'world'});
	});

	return io
};