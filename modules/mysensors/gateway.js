var debug = require('debug')('gateway:mys');

function Gateway(port) {
	this.port = port;
	this.nodes = [];
}


module.exports.serialGateway = function (portName, baudRate) {
	if (!portName) throw new Error("portName is not defined!");
	baudRate = baudRate || 115200;

	var SerialPort = require("serialport").SerialPort;
	var port = new SerialPort(portName, {baudrate: baudRate}, false);

	function connect() {
		debug("Connecting to " + portName + " at " + baudRate + " ...");
		port.open();
	}

	port.on("open", function () {
		debug("Connected");
	});

	port.on("error", function (err) {
		debug("Connection failed. " + err);
		setTimeout(connect, 1000);
	});

	port.on("close", function () {
		debug("Connection closed. ");
	});

	port.on("disconnect", function (err) {
		debug("Disconnected. " + err);
	});

	connect();

	return new Gateway(port);
};


function log(text) {
	console.log(text);
}